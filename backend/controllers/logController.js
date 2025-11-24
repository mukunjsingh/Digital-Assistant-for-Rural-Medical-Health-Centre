const ChatLog = require('../models/ChatLog');

const saveChatLog = async (req, res) => {
  try {
    const { sessionId, userMessage, botResponse, intent, confidence, language } = req.body;

    if (!sessionId || !userMessage || !botResponse) {
      return res
        .status(400)
        .json({ message: 'Please provide sessionId, userMessage, and botResponse' });
    }

    const chatLog = await ChatLog.create({
      user: req.user ? req.user._id : null,
      sessionId,
      userMessage,
      botResponse,
      intent,
      confidence,
      language: language || 'en',
    });

    res.status(201).json(chatLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllChatLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, sessionId } = req.query;

    const query = sessionId ? { sessionId } : {};

    const chatLogs = await ChatLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await ChatLog.countDocuments(query);

    res.json({
      chatLogs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChatLogsBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chatLogs = await ChatLog.find({ sessionId })
      .populate('user', 'name email')
      .sort({ createdAt: 1 });

    res.json(chatLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserChatLogs = async (req, res) => {
  try {
    const chatLogs = await ChatLog.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json(chatLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteChatLog = async (req, res) => {
  try {
    const chatLog = await ChatLog.findById(req.params.id);

    if (!chatLog) {
      return res.status(404).json({ message: 'Chat log not found' });
    }

    await chatLog.deleteOne();
    res.json({ message: 'Chat log removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  saveChatLog,
  getAllChatLogs,
  getChatLogsBySession,
  getUserChatLogs,
  deleteChatLog,
};
