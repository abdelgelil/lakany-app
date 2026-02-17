const express = require('express');
const router = express.Router();
const { enterpriseSignup, login, protect, restrictTo } = require('../controllers/authController');
const { getDoctorStats } = require('../controllers/financeController');
const Appointment = require('../models/Appointment');

// ✅ UPDATE: Import addMedicalHistory here
const {
  createPatient, 
  getPatientHistory, 
  addMedicalHistory, // <--- NEW IMPORT
  getDoctorMe, 
  updateDoctorAvailability,
  getAllPatients // <--- NEW IMPORT for patients route
} = require('../controllers/userController');
// --- Auth Routes ---
router.post('/signup', enterpriseSignup);
router.post('/login', login);

// --- Doctor Routes ---
router.get('/doctor/me', protect, restrictTo('doctor'), getDoctorMe);
router.patch('/doctor/availability', protect, restrictTo('doctor'), updateDoctorAvailability);

// --- Patient Routes ---
router.get('/patients/all', protect, restrictTo('doctor', 'management'), getAllPatients);
router.get('/patients/:id', protect, restrictTo('doctor', 'management'), getPatientHistory);
router.post('/patients', protect, restrictTo('doctor', 'management'), createPatient);
router.post('/patients/:id/history', protect, restrictTo('doctor'), addMedicalHistory);

// --- Finance Routes ---
router.get('/finance-stats', protect, restrictTo('doctor', 'management'), getDoctorStats);

const { finalizeAppointment, updateAppointment, getAllAppointments } = require('../controllers/appointmentController');
// --- Appointments Routes ---
router.get('/appointments', protect, restrictTo('management', 'doctor'), getAllAppointments);
// --- Management Routes ---
router.patch('/appointments/:id/finalize', protect, restrictTo('management'), finalizeAppointment);
router.patch('/appointments/:id', protect, restrictTo('management', 'doctor'), updateAppointment);

module.exports = router;