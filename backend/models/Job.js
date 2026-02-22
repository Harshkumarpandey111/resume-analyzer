const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true        // e.g. "Senior React Developer"
    },
    company: {
      type: String,
      required: true        // e.g. "TechCorp"
    },
    description: {
      type: String,
      default: ''
    },
    requiredSkills: {
      type: [String],       // Array of strings e.g. ["React", "Node.js"]
      default: []
    },
    salary: {
      type: String,
      default: 'Not specified'
    },
    type: {
      type: String,
      enum: ['Remote', 'Hybrid', 'Onsite'],
      default: 'Remote'
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,  // Links to a User
      ref: 'User'                            // Tells Mongoose which model to reference
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Job', JobSchema);