const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authController = require('../controllers/authController');

// --- PUBLIC ROUTES ---
router.get('/clinic-status', appointmentController.getClinicStatus);

// All routes below this line require a valid login token
router.use(authController.protect);

// 1. Management specific routes (Must be above /:id)
router.get(
    '/all', 
    authController.restrictTo('management', 'admin', 'doctor'), 
    appointmentController.getAllAppointments
);

router.get(
    '/doctor-schedule',
    authController.restrictTo('doctor'),
    appointmentController.getDoctorSchedule
);

router.patch(
    '/:id/finalize', 
    authController.restrictTo('management', 'admin', 'doctor'), 
    appointmentController.finalizeAppointment
);

router.patch(
    '/:id/no-show',
    authController.restrictTo('management', 'admin', 'doctor'),
    appointmentController.handleNoShow
);

// 2. Patient specific routes
router.get(
    '/my-appointments',
    authController.restrictTo('patient'),
    appointmentController.getMyAppointments
);

router.put(
    '/cancel/:id',
    authController.restrictTo('patient'),
    appointmentController.cancelAppointment
);

// 3. General CRUD routes
router.post('/', appointmentController.createAppointment);
router.get('/available-slots', appointmentController.getAvailableSlots);
router.get('/:id', appointmentController.getAppointment);
router.patch(
    '/:id',
    authController.restrictTo('management', 'doctor'),
    appointmentController.updateAppointment
);


module.exports = router;