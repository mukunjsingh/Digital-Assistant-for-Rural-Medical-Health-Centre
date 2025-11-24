const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

/**
 * Book a new appointment (Patient)
 * POST /api/appointments/book
 */
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    // Validation
    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, date, time, and reason',
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Verify patient (user) exists
    const patient = await User.findById(req.user._id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId: doctorId,
      date: new Date(date),
      time: time,
      reason: reason,
      status: 'pending',
      // Store patient info for easy access
      patientName: patient.name,
      phone: patient.phone,
      email: patient.email,
    });

    // Populate doctor and patient info
    await appointment.populate('doctorId', 'name specialization contact');
    await appointment.populate('patientId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: appointment,
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to book appointment',
    });
  }
};

/**
 * Get all appointments for a doctor
 * GET /api/appointments/doctor/:doctorId
 */
const getAppointmentsForDoctor = async (req, res) => {
  try {
    let doctorId = req.params.doctorId;

    // If doctor is authenticated, use their ID automatically
    if (req.doctor) {
      doctorId = req.doctor._id.toString();
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // If doctor is authenticated via doctorAuthMiddleware, ensure they can only see their own
    if (req.doctor && req.doctor._id.toString() !== doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view other doctors appointments',
      });
    }

    const appointments = await Appointment.find({ doctorId: doctorId })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization contact')
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments: appointments,
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch appointments',
    });
  }
};

/**
 * Get all appointments for a patient
 * GET /api/appointments/patient/:patientId
 */
const getAppointmentsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify patient exists and matches authenticated user
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // If user is authenticated, verify it's their own appointments
    if (req.user && req.user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view other patients appointments',
      });
    }

    const appointments = await Appointment.find({ patientId: patientId })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization contact')
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments: appointments,
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch appointments',
    });
  }
};

/**
 * Update appointment status (Doctor only)
 * PATCH /api/appointments/:id/status
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, accepted, or rejected',
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Verify doctor is authorized (must be the assigned doctor)
    if (req.doctor) {
      if (appointment.doctorId.toString() !== req.doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this appointment',
        });
      }
    } else if (req.user && req.user.role !== 'admin') {
      // Allow admin to update any appointment
      return res.status(403).json({
        success: false,
        message: 'Only doctors can update appointment status',
      });
    }

    // Update status
    appointment.status = status;
    const updatedAppointment = await appointment.save();

    // Populate before returning
    await updatedAppointment.populate('patientId', 'name email phone');
    await updatedAppointment.populate('doctorId', 'name specialization contact');

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update appointment status',
    });
  }
};

/**
 * Get all doctors (for patient to select)
 * GET /api/appointments/doctors
 */
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select('name specialization contact email').sort({ name: 1 });

    res.json({
      success: true,
      count: doctors.length,
      doctors: doctors,
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch doctors',
    });
  }
};

// Legacy functions for backward compatibility
const createAppointment = bookAppointment; // Alias for backward compatibility

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization contact')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch appointments',
    });
  }
};

const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization contact')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch appointments',
    });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization contact');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Authorization check
    if (req.user) {
      const isPatient = appointment.patientId._id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      if (!isPatient && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this appointment',
        });
      }
    }

    res.json({
      success: true,
      appointment: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch appointment',
    });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Authorization
    if (req.user && req.user.role === 'admin') {
      // Admin can update anything
      Object.assign(appointment, req.body);
    } else if (req.user && appointment.patientId.toString() === req.user._id.toString()) {
      // Patient can update their own appointment details (but not status)
      const { status, ...updateData } = req.body;
      Object.assign(appointment, updateData);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment',
      });
    }

    const updatedAppointment = await appointment.save();
    await updatedAppointment.populate('patientId', 'name email phone');
    await updatedAppointment.populate('doctorId', 'name specialization contact');

    res.json({
      success: true,
      appointment: updatedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update appointment',
    });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Authorization
    if (
      req.user &&
      req.user.role !== 'admin' &&
      appointment.patientId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this appointment',
      });
    }

    await appointment.deleteOne();
    res.json({
      success: true,
      message: 'Appointment removed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete appointment',
    });
  }
};

module.exports = {
  bookAppointment,
  getAppointmentsForDoctor,
  getAppointmentsForPatient,
  updateAppointmentStatus,
  getAllDoctors,
  // Legacy exports for backward compatibility
  createAppointment,
  getAppointments,
  getUserAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
