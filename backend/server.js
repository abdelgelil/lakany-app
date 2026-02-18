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

// --- 4. SERVE FRONTEND ---
const frontendBuildPath = path.join(__dirname, '../lakany-clinic-frontend/dist');
app.use(express.static(frontendBuildPath));

app.get('*', (req, res) => {
    // Adding a check: if the file doesn't exist, it helps with debugging
    res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
        if (err) {
            res.status(500).send("Frontend build files missing in " + frontendBuildPath);
        }
    });
});

// -------------------------------------------------------

// 5. Start Server (UPDATED FOR RAILWAY)
const PORT = process.env.PORT || 5000;

// We add '0.0.0.0' to ensure the server is accessible externally
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📂 Serving frontend from: ${frontendBuildPath}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});