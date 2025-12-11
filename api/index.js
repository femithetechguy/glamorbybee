/**
 * Vercel Serverless API Handler
 * Handles both /api/booking and /api/health requests
 */

import dotenv from 'dotenv';
import createBookingApi from './booking.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize booking API using factory function
let bookingApi;
let emailServiceReady = false;
let initError = null;

try {
    bookingApi = createBookingApi();
    console.log('✅ BookingApi created successfully');
    
    // Initialize email service
    bookingApi.init().then(() => {
        emailServiceReady = true;
        console.log('✅ Email service initialized successfully');
    }).catch(error => {
        console.error('❌ Failed to initialize email service:', error.message);
        initError = error;
    });
} catch (error) {
    console.error('❌ Failed to create BookingApi:', error);
    console.error('Error details:', error.message, error.stack);
    bookingApi = null;
    initError = error;
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
            
            bookingApi.healthCheck().then(health => {
                res.status(200).json(health);
            }).catch(error => {
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

            if (!emailServiceReady) {
                return res.status(503).json({
                    success: false,
                    error: 'Email service is not ready. Please try again in a moment.'
                });
            }

            bookingApi.handleBooking(req.body).then(result => {
                const statusCode = result.success ? 200 : 400;
                res.status(statusCode).json(result);
            }).catch(error => {
                console.error('API error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error. Please try again later.',
                    details: error.message
                });
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
