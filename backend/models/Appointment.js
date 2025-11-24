const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please add appointment date'],
    },
    time: {
      type: String,
      required: [true, 'Please add appointment time'],
    },
    reason: {
      type: String,
      required: [true, 'Please describe the reason for appointment'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    // Keep legacy fields for backward compatibility (optional)
    patientName: {
      type: String,
      trim: true,
    },
    patientAge: {
      type: Number,
    },
    patientGender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    symptoms: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
