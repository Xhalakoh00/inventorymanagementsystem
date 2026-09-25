const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    gender: {
      type: String
    },
    phone: {
      type: String,
      required: true,
      unique: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    HasAdminAccess: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create model from schema
const User = mongoose.model('User', userSchema);

module.exports = User;

