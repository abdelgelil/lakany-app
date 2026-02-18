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

// FIX: Updated CORS to allow your Railway domain
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:3000', 
        'https://lakany-app-production.up.railway.app' // Add your live URL
    ],
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

// IMPORTANT: Removed the app.all('*') 404 block from here. 
// If we leave it here, it will block the frontend files in server.js.

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