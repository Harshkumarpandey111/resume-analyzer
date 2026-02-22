const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true        // Every resume must belong to a user
    },
    rawText: {
      type: String,
      default: ''           // The extracted text from the PDF/DOC
    },
    extractedSkills: {
      type: [String],       // e.g. ["React", "Node.js", "Python"]
      default: []
    },
    fileName: {
      type: String,
      default: ''           // Original file name e.g. "john_resume.pdf"
    },
    matchResults: {
      type: [             // Array of job match objects
        {
          jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
          score: Number,           // Match percentage 0-100
          missingSkills: [String]  // Skills user is missing for this job
        }
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Resume', ResumeSchema);