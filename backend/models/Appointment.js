const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    clinicLocation: { type: String, required: true },
    type: { type: String, required: true },
    status: {
        type: String,
        enum: ['upcoming', 'done', 'completed', 'cancelled', 'no-show'],
        default: 'upcoming'
    },
    price: { type: Number, default: 0 },
    medicalRecord: {
        prescription: String,
        medicalAdvice: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);