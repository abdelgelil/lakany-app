const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

// --- PUBLIC AUTH ROUTES ---
router.post('/signup-patient', authController.patientSignup);
router.post('/signup-enterprise', authController.enterpriseSignup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword); // Fixed 501 Error
router.patch('/resetPassword/:token', authController.resetPassword);

// --- PROTECTED ROUTES (Logged in users) ---
router.use(authController.protect); // All routes below this need login

// Patient Specific
router.get('/doctors', userController.getAllDoctors);
router.get('/patient/me', userController.getMe, userController.updateMe); // Placeholder for getMe logic
router.patch('/patient/updateMe', userController.updateMe);
router.get('/patient/my-appointments', userController.getMyAppointments);

// --- MANAGEMENT/DOCTOR ROUTES (Restricted) ---
router.use(authController.restrictTo('management', 'doctor', 'admin'));

router.get('/enterprise/patients/all', userController.getAllPatients);
router.get('/enterprise/patients/search', userController.searchPatients);
router.post('/enterprise/patients', userController.createPatient); // For AddManagementPatientModal
router.get('/enterprise/patients/:id', userController.getPatientHistory);
router.post('/enterprise/patients/:id/history', userController.addMedicalHistory);

// Doctor Specific
router.get('/doctor/me', userController.getDoctorMe);
router.patch('/doctor/availability', userController.updateDoctorAvailability);

module.exports = router;