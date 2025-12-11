/**
 * Vercel Serverless API Handler - Main Router
 * Routes all API requests to appropriate handlers
 */

import dotenv from 'dotenv';
import createBookingApi from './booking-handler.js';

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

export default async function handler(req, res) {
    try {
        // Parse JSON body if needed
        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                body = {};
            }
        }
        req.body = body || {};

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
            // Validate request body exists
            if (!req.body || !req.body.name) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid booking data'
                });
            }

            if (!bookingApi) {
                return res.status(503).json({
                    success: false,
                    error: 'Service not initialized'
                });
            }

            const reference = `GBB-${Date.now()}`;
            
            // Return success immediately to client (CRITICAL for Vercel)
            res.status(200).json({
                success: true,
                message: 'Your booking has been received! Check your email for confirmation.',
                reference
            });

            // Process booking asynchronously in background WITHOUT waiting
            // This is critical for Vercel's timeout constraints
            setImmediate(async () => {
                try {
                    console.log(`📧 Processing booking in background: ${reference}`);
                    
                    // Initialize email service if needed (should be fast since no verification)
                    await ensureEmailServiceReady();
                    
                    // Handle booking (emails sent in background from handleBooking)
                    await bookingApi.handleBooking(req.body);
                    
                    console.log(`✅ Booking queued for processing: ${reference}`);
                } catch (error) {
                    console.error(`❌ Background booking error (${reference}): ${error.message}`);
                }
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
