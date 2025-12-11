/**
 * Vercel Serverless API Handler
 * Handles both /api/booking and /api/health requests
 */

import dotenv from 'dotenv';
import createBookingApi from './booking.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🚀 API handler initializing...');
console.log('Environment variables loaded:', {
    EMAIL_HOST: process.env.EMAIL_HOST ? '✓' : '✗',
    EMAIL_PORT: process.env.EMAIL_PORT ? '✓' : '✗',
    EMAIL_USER: process.env.EMAIL_USER ? '✓' : '✗',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '✓' : '✗',
    EMAIL_SECURE: process.env.EMAIL_SECURE ? '✓' : '✗',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? '✓' : '✗'
});

// Initialize booking API using factory function
let bookingApi;
let emailServiceInitPromise = null;
let initError = null;

try {
    bookingApi = createBookingApi();
    console.log('✅ BookingApi created successfully');
} catch (error) {
    console.error('❌ Failed to create BookingApi:', error);
    console.error('Error details:', error.message, error.stack);
    bookingApi = null;
    initError = error;
}

// Function to ensure email service is initialized
async function ensureEmailServiceReady() {
    if (emailServiceInitPromise) {
        return emailServiceInitPromise;
    }
    
    if (!bookingApi) {
        throw new Error('BookingApi not initialized');
    }
    
    emailServiceInitPromise = bookingApi.init().catch(error => {
        console.error('❌ Failed to initialize email service:', error.message);
        initError = error;
        throw error;
    });
    
    return emailServiceInitPromise;
}

export default function handler(req, res) {
    try {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );
        
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        const url = new URL(req.url || '', 'http://localhost');
        const pathname = url.pathname;

        // Health check endpoint
        if (pathname === '/api/health' && req.method === 'GET') {
            if (!bookingApi) {
                return res.status(503).json({
                    status: 'error',
                    message: 'Service not initialized',
                    error: initError?.message || 'Unknown error'
                });
            }
            
            ensureEmailServiceReady()
                .then(() => {
                    return bookingApi.healthCheck();
                })
                .then(health => {
                    res.status(200).json(health);
                })
                .catch(error => {
                    console.error('Health check error:', error);
                    res.status(500).json({
                        status: 'error',
                        message: 'Health check failed',
                        error: error.message
                    });
                });
            return;
        }

        // Booking submission endpoint
        if (pathname === '/api/booking' && req.method === 'POST') {
            if (!bookingApi) {
                return res.status(503).json({
                    success: false,
                    error: 'Booking service is not initialized. Please try again later.',
                    details: initError?.message || 'Unknown error'
                });
            }

            // Process booking asynchronously - return response immediately
            // Email sending happens in background
            (async () => {
                try {
                    await ensureEmailServiceReady();
                    // Send emails in background without waiting
                    bookingApi.handleBooking(req.body).catch(error => {
                        console.error('Background booking error:', error);
                    });
                } catch (error) {
                    console.error('Email service init error:', error);
                }
            })();

            // Return success immediately to client
            res.status(200).json({
                success: true,
                message: 'Booking received! We\'re processing your request...',
                reference: `GBB-${Date.now()}`
            });
            return;
        }

        // Not found
        res.status(404).json({
            success: false,
            error: 'API endpoint not found'
        });
    } catch (error) {
        console.error('Handler error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error. Please try again later.',
            details: error.message
        });
    }
}
