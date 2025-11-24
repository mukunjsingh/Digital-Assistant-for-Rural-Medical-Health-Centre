const express = require('express');
const router = express.Router();
const {
  saveChatLog,
  getAllChatLogs,
  getChatLogsBySession,
  getUserChatLogs,
  deleteChatLog,
} = require('../controllers/logController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', saveChatLog);
router.get('/', protect, admin, getAllChatLogs);
router.get('/session/:sessionId', protect, admin, getChatLogsBySession);
router.get('/my-logs', protect, getUserChatLogs);
router.delete('/:id', protect, admin, deleteChatLog);

module.exports = router;
