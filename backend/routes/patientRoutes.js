const express = require('express');
const router = express.Router();
const {
  getAllPatientsForDoctor,
  getPatientById,
  getPatientChatHistory,
  generatePatientSummary,
} = require('../controllers/patientController');
const { protectDoctor } = require('../middleware/doctorAuthMiddleware');

// All routes require doctor authentication
router.get('/', protectDoctor, getAllPatientsForDoctor);
router.get('/:id', protectDoctor, getPatientById);
router.get('/:id/chat-history', protectDoctor, getPatientChatHistory);
router.post('/:id/generate-summary', protectDoctor, generatePatientSummary);

module.exports = router;

