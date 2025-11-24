const express = require('express');
const router = express.Router();
const {
  analyzeUserSymptoms,
  getSymptomHistory,
} = require('../controllers/symptomController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', analyzeUserSymptoms);
router.get('/history/:sessionId', protect, getSymptomHistory);

module.exports = router;
