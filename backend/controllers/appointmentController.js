const Appointment = require('../models/Appointment');

// @desc    Get all appointments for Management
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patientId', 'username phone email')
            .sort('-date');

        res.status(200).json({
            success: true,
            results: appointments.length,
            data: appointments
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get available time slots for a specific doctor and date
exports.getAvailableSlots = async (req, res) => {
    try {
        const { date, clinicName, doctorId } = req.query;

        if (!date || !doctorId) {
            return res.status(400).json({ success: false, message: 'Date and Doctor ID are required.' });
        }

        // 1. Determine Clinic Schedule (Defaulting to 10-16 if unknown, but matching specific clinics)
        let startHour = 10;
        let endHour = 16;

        if (clinicName === 'Janaklees Clinic') {
            startHour = 18; // 6 PM
            endHour = 22;   // 10 PM
        } else if (clinicName === 'Mahatet al Raml Clinic') {
            startHour = 13; // 1 PM
            endHour = 14;   // 2 PM
        }

        // 2. Generate Master List of Slots (30 min intervals)
        const masterSlots = [];
        for (let h = startHour; h < endHour; h++) {
            masterSlots.push(`${h.toString().padStart(2, '0')}:00`);
            masterSlots.push(`${h.toString().padStart(2, '0')}:30`);
        }

        // 3. Fetch Existing Appointments for that Day
        const queryDate = new Date(date);
        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

        const existingAppointments = await Appointment.find({
            doctorId,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'cancelled' }
        });

        // 4. Map Booked Times (Converting DB time to HH:mm string)
        // Note: Assuming server/DB handles timezone correctly or using 'Africa/Cairo' for Egypt clinics
        const bookedTimes = existingAppointments.map(app => {
            return app.date.toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Africa/Cairo' // Force Egypt time for accuracy
            });
        });

        // 5. Filter Slots
        const availableSlots = masterSlots.map(time => ({
            time,
            available: !bookedTimes.includes(time)
        }));

        res.status(200).json({
            success: true,
            data: availableSlots
        });

    } catch (err) {
        console.error("Slot Fetch Error:", err);
        res.status(500).json({ success: false, message: 'Failed to fetch slots: ' + err.message });
    }
};

// @desc    Get all appointments for a specific doctor
exports.getDoctorSchedule = async (req, res) => {
    try {
        // The doctor's ID is attached to the request by the 'protect' middleware
        const doctorId = req.user.id;

        if (!doctorId) {
            return res.status(400).json({ success: false, message: 'Doctor ID not found. You may not be logged in correctly.' });
        }

        const appointments = await Appointment.find({ doctorId: doctorId })
            .populate('patientId', 'username phone email')
            .sort('date');

        res.status(200).json({
            success: true,
            results: appointments.length,
            data: appointments
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
};

// @desc    Get all appointments for the logged-in patient
exports.getMyAppointments = async (req, res) => {
    try {
        const patientId = req.user.id;
        const appointments = await Appointment.find({ patientId: patientId })
            .populate('doctorId', 'username') // Get doctor's name
            .sort('-date');

        res.status(200).json({
            success: true,
            results: appointments.length,
            data: appointments
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
};

// @desc    Allow a patient to cancel their own appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }

        // Security Check: Ensure the person cancelling is the patient who booked it
        if (appointment.patientId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You are not authorized to cancel this appointment.' });
        }

        // Prevent cancellation of past or already completed appointments
        if (['completed', 'done', 'cancelled'].includes(appointment.status)) {
            return res.status(400).json({ success: false, message: `Cannot cancel an appointment that is already ${appointment.status}.` });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
};


// @desc    Create new appointment
exports.createAppointment = async (req, res) => {
    try {
        // 1. Get the patient ID from the 'protect' middleware (req.user)
        const patientId = req.user.id; 

        // 2. Add it to the body before creating
        const appointmentData = {
            ...req.body,
            patientId: patientId
        };

        const newAppointment = await Appointment.create(appointmentData);
        res.status(201).json({ success: true, data: newAppointment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single appointment
exports.getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId', 'username email')
            .populate('doctorId', 'username');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }

        const user = req.user;
        const isPatientOwner = user.role === 'patient' && appointment.patientId._id.toString() === user.id;
        const isStaff = ['doctor', 'management', 'admin'].includes(user.role);

        // A patient can only see their own records. Staff (doctor, admin, etc.) can see any.
        if (!isPatientOwner && !isStaff) {
            return res.status(403).json({ success: false, message: 'You are not authorized to view this record.' });
        }
        
        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
};

// @desc    Finalize and Bill (Management only)
exports.finalizeAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'completed', price: req.body.fee },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mark an appointment as a no-show
exports.handleNoShow = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'no-show' },
            { new: true, runValidators: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'No appointment found with that ID' });
        }

        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update appointment details (Status, Date, etc.)
exports.updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'No appointment found with that ID' });
        }

        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get public clinic status
exports.getClinicStatus = async (req, res) => {
    res.status(200).json({
        success: true,
        status: 'open',
        message: 'Clinic is operational'
    });
};