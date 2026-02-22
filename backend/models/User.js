const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,      // Can't create a user without a name
      trim: true           // Removes accidental spaces at start/end
    },
    email: {
      type: String,
      required: true,
      unique: true,        // No two users can have the same email
      lowercase: true      // Stores email as lowercase always
    },
    password: {
      type: String,
      required: true,
      minlength: 6         // Minimum 6 characters
    },
    role: {
      type: String,
      enum: ['user', 'admin'],  // Only these two values allowed
      default: 'user'           // New signups are always 'user'
    }
  },
  {
    timestamps: true   // Auto adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('User', UserSchema);