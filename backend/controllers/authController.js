const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/email');

/**
 * HELPER FUNCTIONS
 */
const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id, user.role);
    
    // Hide password from output
    user.password = undefined;

    const cookieOptions = {
        expires: new Date(
            Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 1) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);
    res.status(statusCode).json({
        success: true,
        token,
        data: { user }
    });
};

/**
 * AUTHENTICATION CONTROLLERS
 */

// @desc    Register a patient
exports.patientSignup = async (req, res) => {
    try {
        const user = await User.create({
            ...req.body,
            role: 'patient'
        });
        createSendToken(user, 201, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Register a doctor or management staff
exports.enterpriseSignup = async (req, res) => {
    try {
        const { role } = req.body;
        const allowedRoles = ['doctor', 'management'];
        
        if (!allowedRoles.includes(role?.toLowerCase())) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid role. Allowed: ${allowedRoles.join(', ')}` 
            });
        }

        const user = await User.create({
            ...req.body,
            role: role.toLowerCase()
        });

        createSendToken(user, 201, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Login user via Email or Phone
exports.login = async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        if (!(email || phone) || !password) {
            return res.status(400).json({ success: false, message: 'Provide email/phone and password' });
        }

        const user = await User.findOne(email ? { email } : { phone }).select('+password');
        
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * MIDDLEWARE
 */

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return res.status(401).json({ success: false, message: 'Not logged in' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);
        
        if (!currentUser) return res.status(401).json({ success: false, message: 'User no longer exists' });
        
        req.user = currentUser;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role?.toLowerCase())) {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }
        next();
    };
};

/**
 * PASSWORD RESET LOGIC
 */

// @desc    Forgot Password - Sends styled email
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with that email' });
        }

        // Generate raw reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash it and save to DB (Matches your Model fields)
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        
        await user.save({ validateBeforeSave: false });

        const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Secure Password Reset Request',
                messageBody: 'We received a request to access your Lakany Pain Clinic account. To ensure the security of your records, please use the secure link below to reset your password.',
                resetURL: resetURL
            });

            res.status(200).json({ success: true, message: 'Token sent to email!' });
        } catch (mailErr) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            
            console.error("Mail Error:", mailErr);
            return res.status(500).json({ success: false, message: 'Error sending email' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Reset Password - Verifies hashed token and updates DB
exports.resetPassword = async (req, res) => {
    try {
        // 1) Get hashed token from URL param
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        // 2) Find user with valid token and time (Matches your Model fields)
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
        }

        // 3) Update password and clear reset fields
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        
        // This triggers the .pre('save') hook in your model to hash the password
        await user.save();

        // 4) Send Confirmation Email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Security Confirmation: Password Changed',
                messageBody: 'The password for your Lakany Pain Clinic account has been successfully updated. You can now log in with your new credentials.',
                resetURL: null
            });
        } catch (err) {
            console.log("Confirmation email failed to send.");
        }

        // 5) Log user in
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};