const { analyzeSymptoms } = require('../utils/dialogflowClient');
const ChatLog = require('../models/ChatLog');

const analyzeUserSymptoms = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ message: 'Please provide message and sessionId' });
    }

    const analysis = await analyzeSymptoms(message, sessionId);

    const chatLog = await ChatLog.create({
      user: req.user ? req.user._id : null,
      sessionId,
      userMessage: message,
      botResponse: analysis.response,
      intent: analysis.intent,
      confidence: analysis.confidence,
    });

    res.json({
      response: analysis.response,
      intent: analysis.intent,
      confidence: analysis.confidence,
      suggestions: analysis.suggestions,
      chatLogId: chatLog._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSymptomHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: 'Please provide sessionId' });
    }

    const history = await ChatLog.find({ sessionId }).sort({ createdAt: 1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  analyzeUserSymptoms,
  getSymptomHistory,
};
