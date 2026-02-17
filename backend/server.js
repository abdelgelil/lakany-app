const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// 1. Load Environment Variables
dotenv.config(); 

const app = require('./app');

// 2. Database Connection Logic
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Database Error: ${error.message}`);
        process.exit(1);
    }
};
connectDB();

// 3. API Routes & Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is healthy' });
});

// --- 4. SERVE FRONTEND (The missing link for Railway) ---

// This points to the 'dist' folder created by 'npm run build' inside your frontend folder
const frontendBuildPath = path.join(__dirname, '../lakany-clinic-frontend/dist');

// Tell Express to serve the static files (CSS, JS, Images)
app.use(express.static(frontendBuildPath));

// Handle React Routing: Send index.html for any request that isn't an API call
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// -------------------------------------------------------

// 5. Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(
    PORT,
    () => console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});