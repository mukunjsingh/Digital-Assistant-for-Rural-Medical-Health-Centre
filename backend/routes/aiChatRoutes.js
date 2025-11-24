const express = require('express');
const router = express.Router();
const { chatWithAI, checkAIHealth } = require('../controllers/aiChatController');
const { protect } = require('../middleware/authMiddleware');

/**
 * AI Chat Routes
 * Note: Authentication is optional - allows anonymous users to chat
 * but authenticated users will have their chats logged with their user ID
 */

// Health check endpoint to verify AI service configuration
router.get('/health', checkAIHealth);

// Main chat endpoint
router.post('/', chatWithAI);

// Optional: Protected route that requires authentication
router.post('/protected', protect, chatWithAI);

module.exports = router;

