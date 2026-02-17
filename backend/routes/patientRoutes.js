const express = require('express');
const { patientSignup, login, protect, restrictTo } = require('../controllers/authController');
const { createPatient, searchPatients, getPatientHistory, getMyAppointments, getMe, updateMe } = require('../controllers/userController');

const router = express.Router();

// Public routes
router.post('/signup', patientSignup);
router.post('/login', login);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.get('/my-appointments', getMyAppointments);
router.patch('/updateMe', updateMe);

// The following routes are protected and restricted to management and doctors
router.use(restrictTo('management', 'doctor'));
router.post('/', createPatient);
router.get('/search', searchPatients);
router.get('/:id', getPatientHistory);

module.exports = router;