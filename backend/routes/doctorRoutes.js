const express = require('express');
const router = express.Router();
const {
  registerDoctor,
  loginDoctor,
  getLoggedInDoctor,
} = require('../controllers/doctorController');
const { protectDoctor } = require('../middleware/doctorAuthMiddleware');

router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.get('/me', protectDoctor, getLoggedInDoctor);

module.exports = router;


