const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// 1. FIX: Load env vars FIRST, before loading 'app' or 'mongoose'
// If your file is named '.env', you don't strictly need the path, but it's safer.
dotenv.config({ path: path.join(__dirname, '.env') }); 

// 2. NOW require the app and database
const mongoose = require('mongoose');
const app = require('./app');
const Appointment = require('./models/Appointment'); // Assuming path to Appointment model

// Optional: Quick Debug to prove it's loaded
console.log("🔍 Server Config Check:");
console.log("- Mongo URI:", process.env.MONGO_URI ? "✅ Loaded" : "❌ Missing");
console.log("- Email User:", process.env.EMAIL_USERNAME ? "✅ Loaded" : "❌ Missing");

// Connect to database

// --- Health Check Endpoint ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is healthy' });
});

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});