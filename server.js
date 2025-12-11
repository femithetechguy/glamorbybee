/**
 * GlamorByBee Server
 * 
 * Express server handling:
 * - Static file serving for landing page
 * - /api/booking endpoint for form submissions
 * - Health check endpoint
 * - Email service initialization
 * - Environment variable configuration
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import createBookingApi from './api/booking.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Initialize booking API using factory function
let bookingApi;
try {
    bookingApi = createBookingApi();
} catch (error) {
    console.error('Failed to create BookingApi:', error);
    bookingApi = null;
}

// Initialize email service on startup
let emailServiceReady = false;
if (bookingApi) {
    (async () => {
        try {
            await bookingApi.init();
            emailServiceReady = true;
            console.log('✅ Email service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error.message);
            console.log('⚠️  Server will still start but email functionality will not work.');
            console.log('💡 Make sure environment variables are set correctly');
        }
    })();
}

// Serve static files from root directory
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        if (!bookingApi) {
            return res.status(503).json({
                status: 'error',
                message: 'Service not initialized'
            });
        }
        const health = await bookingApi.healthCheck();
        res.json(health);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Health check failed'
        });
    }
});

// Booking submission endpoint
app.post('/api/booking', async (req, res) => {
    try {
        // Check if BookingApi is initialized
        if (!bookingApi) {
            return res.status(503).json({
                success: false,
                error: 'Booking service is not initialized. Please try again later.'
            });
        }

        // Check if email service is ready
        if (!emailServiceReady) {
            return res.status(503).json({
                success: false,
                error: 'Email service is not ready. Please try again in a moment.'
            });
        }

        // Process booking
        const result = await bookingApi.handleBooking(req.body);

        // Return appropriate status code
        const statusCode = result.success ? 200 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error. Please try again later.'
        });
    }
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found'
    });
});

// Fallback to serve index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log('\n🌟 GlamorByBee Server');
    console.log(`📍 Running on http://localhost:${PORT}`);
    console.log(`📧 Email service status: ${emailServiceReady ? '✅ Ready' : '⚠️  Not ready'}`);
    console.log('\n✨ Server is ready to receive bookings!');
    console.log('💡 Visit http://localhost:3000 to test the booking form\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n📛 Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
