const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../controllers/authController');
const Appointment = require('../models/Appointment');
const { getAllPatients, searchPatients } = require('../controllers/userController');

router.get('/appointments', protect, restrictTo('management', 'admin'), async (req, res) => {
    try {
      const appointments = await Appointment.find({})
        .populate({ path: 'patientId', select: 'username phone' })
        .sort({ date: -1 });
  
      res.status(200).json({
        status: 'success',
        success: true,
        results: appointments.length,
        data: appointments,
      });
    } catch (error) {
      console.error('Error fetching all appointments for management:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch appointments' });
    }
  });

router.get('/patients', protect, restrictTo('doctor', 'management'), getAllPatients);
router.get('/patients/search', protect, restrictTo('doctor', 'management'), searchPatients);


module.exports = router;
