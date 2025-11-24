const Doctor = require('../models/Doctor');
const generateToken = require('../utils/tokenGenerator');

const sanitizeDoctor = (doctor) => ({
  _id: doctor._id,
  name: doctor.name,
  email: doctor.email,
  specialization: doctor.specialization,
  contact: doctor.contact,
  createdAt: doctor.createdAt,
});

const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, contact } = req.body;

    if (!name || !email || !password || !specialization || !contact) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const doctorExists = await Doctor.findOne({ email });

    if (doctorExists) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    const doctor = await Doctor.create({
      name,
      email,
      password,
      specialization,
      contact,
    });

    res.status(201).json({
      ...sanitizeDoctor(doctor),
      token: generateToken(doctor._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const doctor = await Doctor.findOne({ email }).select('+password');

    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await doctor.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      ...sanitizeDoctor(doctor),
      token: generateToken(doctor._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLoggedInDoctor = async (req, res) => {
  try {
    if (!req.doctor) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(sanitizeDoctor(req.doctor));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerDoctor,
  loginDoctor,
  getLoggedInDoctor,
};


