const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    sessionId: {
      type: String,
      required: true,
    },
    userMessage: {
      type: String,
      required: true,
    },
    botResponse: {
      type: String,
      required: true,
    },
    intent: {
      type: String,
      required: false,
    },
    confidence: {
      type: Number,
      required: false,
    },
    language: {
      type: String,
      default: 'en',
    },
  },
  {
    timestamps: true,
  }
);

chatLogSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatLog', chatLogSchema);
