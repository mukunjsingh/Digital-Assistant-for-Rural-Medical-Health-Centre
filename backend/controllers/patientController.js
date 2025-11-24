const User = require('../models/User');
const ChatLog = require('../models/ChatLog');
const { generateAIResponse } = require('../utils/aiService');

/**
 * Get all patients for doctor
 * GET /api/doctor/patients
 */
const getAllPatientsForDoctor = async (req, res) => {
  try {
    const patients = await User.find({ role: 'user' })
      .select('name email phone createdAt visitCount lastSummary')
      .sort({ createdAt: -1 });

    // Format response with visit count
    const patientsWithVisits = patients.map((patient) => ({
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      createdAt: patient.createdAt,
      visitCount: patient.visitCount || 0,
      hasSummary: !!patient.lastSummary,
    }));

    res.json({
      success: true,
      count: patientsWithVisits.length,
      patients: patientsWithVisits,
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch patients',
    });
  }
};

/**
 * Get patient by ID with full details
 * GET /api/doctor/patients/:id
 */
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await User.findById(id).select('-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    if (patient.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'This is not a patient account',
      });
    }

    res.json({
      success: true,
      patient: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        createdAt: patient.createdAt,
        visitCount: patient.visitCount || 0,
        lastSummary: patient.lastSummary || null,
        chatLogsCount: patient.chatLogs ? patient.chatLogs.length : 0,
      },
    });
  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch patient details',
    });
  }
};

/**
 * Get patient chat history
 * GET /api/doctor/patients/:id/chat-history
 */
const getPatientChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify patient exists
    const patient = await User.findById(id);
    if (!patient || patient.role !== 'user') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // Get chat logs from both User model and ChatLog model
    const userChatLogs = patient.chatLogs || [];
    
    // Also get from ChatLog collection for backward compatibility
    const chatLogsFromDB = await ChatLog.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Combine and format chat logs
    const allChatLogs = [];

    // Add from User model chatLogs
    userChatLogs.forEach((log) => {
      allChatLogs.push({
        message: log.message,
        role: log.role,
        timestamp: log.timestamp,
        sessionId: log.sessionId,
        source: 'user_model',
      });
    });

    // Add from ChatLog collection (convert to same format)
    chatLogsFromDB.forEach((log) => {
      // Add user message
      allChatLogs.push({
        message: log.userMessage,
        role: 'user',
        timestamp: log.createdAt,
        sessionId: log.sessionId,
        source: 'chatlog_collection',
      });
      // Add bot response
      allChatLogs.push({
        message: log.botResponse,
        role: 'bot',
        timestamp: log.createdAt,
        sessionId: log.sessionId,
        source: 'chatlog_collection',
      });
    });

    // Sort by timestamp (newest first)
    allChatLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Get total count
    const totalCount = userChatLogs.length + (await ChatLog.countDocuments({ user: id }));

    res.json({
      success: true,
      chatHistory: allChatLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Get patient chat history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch chat history',
    });
  }
};

/**
 * Generate patient summary using AI
 * POST /api/doctor/patients/:id/generate-summary
 */
const generatePatientSummary = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify patient exists
    const patient = await User.findById(id);
    if (!patient || patient.role !== 'user') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // Check if summary already exists and is recent (optional: can regenerate)
    if (patient.lastSummary && !req.body.forceRegenerate) {
      return res.json({
        success: true,
        summary: patient.lastSummary,
        cached: true,
        message: 'Using cached summary. Use forceRegenerate=true to regenerate.',
      });
    }

    // Get recent chat logs to generate summary
    const recentChats = patient.chatLogs
      ? patient.chatLogs.slice(-10).map((log) => `${log.role}: ${log.message}`).join('\n')
      : 'No recent chat history available.';

    // Create prompt for AI summary
    const summaryPrompt = `You are a medical assistant. Generate a concise health summary for a patient based on their recent interactions:

Patient: ${patient.name}
Recent Chat History:
${recentChats}

Please provide a brief summary (2-3 sentences) of:
1. Main health concerns mentioned
2. Key symptoms discussed
3. Any recommendations or follow-ups needed

Keep it professional and concise.`;

    // Generate summary using AI
    let summary = 'No summary available. Patient has no recent chat history.';
    
    try {
      const aiResponse = await generateAIResponse(summaryPrompt, `summary_${id}_${Date.now()}`);
      summary = aiResponse.response || summary;
    } catch (aiError) {
      console.error('AI summary generation error:', aiError);
      // Fallback summary
      summary = `Patient ${patient.name} has ${patient.visitCount || 0} total visits. ${
        patient.chatLogs && patient.chatLogs.length > 0
          ? `Recent interactions show active engagement with health assistant.`
          : `No detailed chat history available.`
      }`;
    }

    // Save summary to patient record
    patient.lastSummary = summary;
    await patient.save();

    res.json({
      success: true,
      summary: summary,
      cached: false,
      visitCount: patient.visitCount || 0,
    });
  } catch (error) {
    console.error('Generate patient summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate summary',
    });
  }
};

module.exports = {
  getAllPatientsForDoctor,
  getPatientById,
  getPatientChatHistory,
  generatePatientSummary,
};

