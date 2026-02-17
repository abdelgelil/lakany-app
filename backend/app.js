const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const appointmentRouter = require('./routes/appointmentRoutes');
const userRouter = require('./routes/userRoutes');
const enterpriseRouter = require('./routes/enterpriseRoutes');
const patientRouter = require('./routes/patientRoutes');
const adminRouter = require('./routes/adminRoutes');

const app = express();

// --- GLOBAL MIDDLEWARES ---

// Allow Frontend access and Authorization headers
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// --- ROUTES ---
app.use('/api/appointments', appointmentRouter);
app.use('/api/users', userRouter);
app.use('/api/enterprise', enterpriseRouter);
app.use('/api/patient', patientRouter);
app.use('/api/admin', adminRouter);

// Catch-all 404
app.all('*', (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});

// Final Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

module.exports = app;