const { generateAIResponse } = require('../utils/aiService');
const ChatLog = require('../models/ChatLog');
const User = require('../models/User');

/**
 * Check AI service configuration
 * GET /api/ai-chat/health
 */
const checkAIHealth = async (req, res) => {
  try {
    const aiProvider = process.env.AI_PROVIDER || 'openai';
    let apiKey;
    let helpUrl;
    
    if (aiProvider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY;
      helpUrl = 'https://platform.openai.com/api-keys';
    } else if (aiProvider === 'groq') {
      apiKey = process.env.GROQ_API_KEY;
      helpUrl = 'https://console.groq.com/keys';
    } else if (aiProvider === 'gemini') {
      apiKey = process.env.GEMINI_API_KEY;
      helpUrl = 'https://makersuite.google.com/app/apikey';
    }
    
    const isConfigured = !!apiKey;
    
    res.json({
      status: isConfigured ? 'configured' : 'not_configured',
      provider: aiProvider,
      hasApiKey: isConfigured,
      message: isConfigured 
        ? `AI service is configured with ${aiProvider}` 
        : `Please set ${aiProvider.toUpperCase()}_API_KEY in your .env file`,
      helpUrl: helpUrl || 'https://console.groq.com/keys'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Handle AI chat requests
 * POST /api/ai-chat
 */
const chatWithAI = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    // Validation
    if (!message || !sessionId) {
      return res.status(400).json({ 
        message: 'Please provide message and sessionId' 
      });
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Message must be a non-empty string' 
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({ 
        message: 'Message is too long. Please keep it under 2000 characters.' 
      });
    }

    // Check if AI service is configured before making the call
    const aiProvider = process.env.AI_PROVIDER || 'openai';
    let apiKey;
    if (aiProvider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY;
    } else if (aiProvider === 'groq') {
      apiKey = process.env.GROQ_API_KEY;
    } else if (aiProvider === 'gemini') {
      apiKey = process.env.GEMINI_API_KEY;
    }
    
    // Allow fallback mode (mock) if no API key is configured
    if (!apiKey && aiProvider !== 'mock' && aiProvider !== 'fallback') {
      console.warn(`AI Service Configuration Warning: ${aiProvider.toUpperCase()}_API_KEY is not set. Using enhanced mock responses.`);
      console.warn(`To use real AI: Set ${aiProvider.toUpperCase()}_API_KEY in .env file or set AI_PROVIDER=mock`);
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(message, sessionId);

    // Save chat log (optional - user can be null for anonymous users)
    let chatLog = null;
    try {
      chatLog = await ChatLog.create({
        user: req.user ? req.user._id : null,
        sessionId,
        userMessage: message,
        botResponse: aiResponse.response,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        language: req.body.language || 'en',
      });
    } catch (logError) {
      // Don't fail the request if logging fails
      console.error('Failed to save chat log:', logError);
    }

    // If user is authenticated, save to user record and increment visitCount
    if (req.user && req.user._id) {
      try {
        const user = await User.findById(req.user._id);
        if (user) {
          // Initialize chatLogs array if it doesn't exist
          if (!user.chatLogs) {
            user.chatLogs = [];
          }

          // Check if this is a new session (before adding messages)
          const existingSessionMessages = user.chatLogs.filter(
            (log) => log.sessionId === sessionId
          );
          const isNewSession = existingSessionMessages.length === 0;

          // Add user message to chatLogs
          user.chatLogs.push({
            message: message,
            role: 'user',
            timestamp: new Date(),
            sessionId: sessionId,
          });

          // Add bot response to chatLogs
          user.chatLogs.push({
            message: aiResponse.response,
            role: 'bot',
            timestamp: new Date(),
            sessionId: sessionId,
          });

          // Increment visitCount only for new sessions (first interaction)
          if (isNewSession) {
            user.visitCount = (user.visitCount || 0) + 1;
          }

          // Keep only last 100 chat logs to prevent document from growing too large
          if (user.chatLogs.length > 100) {
            user.chatLogs = user.chatLogs.slice(-100);
          }

          await user.save();
        }
      } catch (userUpdateError) {
        // Don't fail the request if user update fails
        console.error('Failed to update user chat logs:', userUpdateError);
      }
    }

    // Return response
    res.json({
      response: aiResponse.response,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      suggestions: aiResponse.suggestions,
      chatLogId: chatLog ? chatLog._id : null,
      model: aiResponse.model,
    });
  } catch (error) {
    console.error('AI Chat Controller Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      aiProvider: process.env.AI_PROVIDER,
      hasApiKey: !!(process.env.AI_PROVIDER === 'openai' ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY)
    });
    
    // Handle specific error types
    if (error.message.includes('API key') || error.message.includes('not configured') || error.message.includes('OPENAI_API_KEY') || error.message.includes('GEMINI_API_KEY')) {
      const aiProvider = process.env.AI_PROVIDER || 'openai';
      return res.status(500).json({ 
        message: `AI service is not properly configured. Please add ${aiProvider.toUpperCase()}_API_KEY to your backend/.env file. Check backend/README.md for setup instructions.`,
        errorCode: 'AI_NOT_CONFIGURED',
        hint: `Get API key from: ${aiProvider === 'openai' ? 'https://platform.openai.com/api-keys' : 'https://makersuite.google.com/app/apikey'}`
      });
    }

    if (error.message.includes('rate limit') || error.message.includes('quota') || error.message.includes('429')) {
      return res.status(429).json({ 
        message: 'AI service is currently busy or you have exceeded your API quota. Please try again in a moment or check your API account for usage limits.',
        errorCode: 'RATE_LIMIT'
      });
    }

    if (error.message.includes('401') || error.message.includes('unauthorized') || error.message.includes('Invalid API key')) {
      return res.status(500).json({ 
        message: 'Invalid API key. Please check your API key in the .env file and ensure it is correct.',
        errorCode: 'INVALID_API_KEY'
      });
    }

    // Generic error response
    res.status(500).json({ 
      message: error.message || 'Failed to generate AI response. Please try again.',
      errorCode: 'UNKNOWN_ERROR'
    });
  }
};

module.exports = {
  chatWithAI,
  checkAIHealth,
};
