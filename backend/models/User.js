const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        unique: true
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'management'],
        default: 'patient'
    },
    // ✅ NEW: Explicit default to prevent "Terminated" flickering
    isAvailable: {
        type: Boolean,
        default: true
    },
    language: {
        type: String,
        default: 'en'
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    history: [{
        date: { type: Date, default: Date.now },
        medicalAdvice: { type: String },
        prescription: { type: String },
        requiredDocuments: { type: String },
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        doctorName: { type: String }
    }]
});

// Encrypt password using bcrypt
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return; 
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 
    return resetToken;
};

module.exports = mongoose.model('User', userSchema);