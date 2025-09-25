const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: false,
    select: false
  },
  displayName: {
    type: String,
    required: false,
    trim: true
  },
  avatarUrl: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  roles: {
    type: [String],
    default: ['user']
  },
  provider: {
    type: String,
    enum: ['local', 'firebase', 'google', 'github', 'anonymous', 'dev'],
    default: 'local'
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.passwordHash;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Rely on schema-level unique constraint to avoid duplicate index definitions
// userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);


