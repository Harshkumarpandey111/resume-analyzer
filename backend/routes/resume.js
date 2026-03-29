const express  = require('express');
const multer   = require('multer');
const mammoth  = require('mammoth');
const PDFParser = require('pdf2json');
const Resume   = require('../models/Resume');
const Job      = require('../models/Job');
const { auth } = require('../middleware/auth');
const { extractSkills, calculateMatchScore } = require('../utils/skillExtractor');

const router = express.Router();

// ─── Multer Setup ─────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only PDF, Word, or TXT files allowed'));
  }
});

// ─── PDF Parser Function ──────────────────────────────
function parsePDF(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on('pdfParser_dataError', (err) => {
      reject(new Error(err.parserError));
    });

    pdfParser.on('pdfParser_dataReady', () => {
      try {
        const text = pdfParser.getRawTextContent();
        resolve(text);
      } catch (e) {
        reject(e);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

// ─── UPLOAD & ANALYZE ─────────────────────────────────
router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '❌ No file uploaded' });
    }

    console.log('📁 File:', req.file.originalname);
    console.log('📋 Type:', req.file.mimetype);
    console.log('📦 Size:', req.file.size, 'bytes');

    let rawText = '';

    // ── Extract text based on file type ──────────────
    if (req.file.mimetype === 'application/pdf') {

      try {
        rawText = await parsePDF(req.file.buffer);
        console.log('✅ PDF text length:', rawText.length);
        console.log('📄 Preview:', rawText.substring(0, 300));
      } catch (pdfErr) {
        console.error('❌ PDF error:', pdfErr.message);
        return res.status(500).json({
          message: '❌ Could not read your PDF. Please try uploading a Word (.docx) file instead.',
          error: pdfErr.message
        });
      }

    } else if (
      req.file.mimetype === 'application/msword' ||
      req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const data = await mammoth.extractRawText({ buffer: req.file.buffer });
      rawText = data.value;
      console.log('✅ Word text length:', rawText.length);

    } else {
      rawText = req.file.buffer.toString('utf8');
      console.log('✅ Text length:', rawText.length);
    }

    // ── Safety check ─────────────────────────────────
    if (!rawText || rawText.trim().length < 5) {
      return res.status(400).json({
        message: '❌ File appears empty. Please try a Word (.docx) or text (.txt) file.'
      });
    }

    // ── Extract Skills ────────────────────────────────
    const extractedSkills = await extractSkills(rawText);
    console.log('🎯 Skills found:', extractedSkills);

    // ── Match against Jobs ────────────────────────────
    const allJobs = await Job.find();
    const matchResults = allJobs.map(job => {
      const result = calculateMatchScore(extractedSkills, job.requiredSkills);
      return {
        jobId:         job._id,
        score:         result.score        || 0,
        missingSkills: result.missingSkills || []
      };
    });

    // ── Save to Database ──────────────────────────────
    let resume = await Resume.findOne({ userId: req.user.id });
    if (resume) {
      resume.rawText         = rawText;
      resume.extractedSkills = extractedSkills;
      resume.fileName        = req.file.originalname;
      resume.matchResults    = matchResults;
      await resume.save();
    } else {
      resume = await Resume.create({
        userId:         req.user.id,
        rawText,
        extractedSkills,
        fileName:       req.file.originalname,
        matchResults
      });
    }

    res.json({
      message:     '✅ Resume analyzed successfully!',
      extractedSkills,
      totalSkills: extractedSkills.length,
      matchResults
    });

  } catch (err) {
    console.error('❌ Server error:', err.message);
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
});

// ─── GET MY RESUME ────────────────────────────────────
router.get('/my', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id })
      .populate('matchResults.jobId', 'title company salary type requiredSkills');

    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: '❌ Server error' });
  }
});

module.exports = router;
