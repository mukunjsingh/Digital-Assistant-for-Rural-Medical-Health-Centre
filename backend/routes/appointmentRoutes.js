const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointmentsForDoctor,
  getAppointmentsForPatient,
  updateAppointmentStatus,
  getAllDoctors,
  // Legacy functions
  createAppointment,
  getAppointments,
  getUserAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { protectDoctor } = require('../middleware/doctorAuthMiddleware');

// New appointment booking endpoint
router.post('/book', protect, bookAppointment);

// Get all doctors (for patient selection)
router.get('/doctors', getAllDoctors);

// Get appointments for a specific doctor (doctor protected)
router.get('/doctor/:doctorId', protectDoctor, getAppointmentsForDoctor);

// Get appointments for a specific patient (patient protected)
router.get('/patient/:patientId', protect, getAppointmentsForPatient);

// Update appointment status (doctor protected)
router.patch('/:id/status', protectDoctor, updateAppointmentStatus);

// Legacy routes for backward compatibility
router.route('/').post(protect, createAppointment).get(protect, getAppointments);
router.get('/my-appointments', protect, getUserAppointments);
router
  .route('/:id')
  .get(protect, getAppointmentById)
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

module.exports = router;
