const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'system'],
    default: 'message'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
