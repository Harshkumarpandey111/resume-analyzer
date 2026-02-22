const express = require('express');
const Job = require('../models/Job');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ─── GET ALL JOBS (Public) ────────────────────────────
// GET http://localhost:5000/api/jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    // sort by newest first
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: '❌ Server error' });
  }
});

// ─── POST A JOB (Admin Only) ──────────────────────────
// POST http://localhost:5000/api/jobs
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { title, company, description, requiredSkills, salary, type } = req.body;

    const job = new Job({
      title,
      company,
      description,
      requiredSkills,
      salary,
      type,
      postedBy: req.user.id
    });

    await job.save();
    res.status(201).json({ message: '✅ Job posted!', job });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
});

// ─── DELETE A JOB (Admin Only) ───────────────────────
// DELETE http://localhost:5000/api/jobs/:id
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Job deleted' });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error' });
  }
});

module.exports = router;