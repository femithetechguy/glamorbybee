/**
 * Vercel Serverless Function: POST /api/booking
 * Dedicated endpoint for booking submissions
 * 
 * This file is automatically loaded by Vercel as a serverless function
 */

import dotenv from 'dotenv';
import createBookingApi from './booking-handler.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize booking API
let bookingApi;
let emailServiceInitPromise = null;

try {
    bookingApi = createBookingApi();
    console.log('✅ BookingApi initialized');
} catch (error) {
    console.error('❌ Failed to initialize BookingApi:', error.message);
    bookingApi = null;
}

// Ensure email service is initialized
async function ensureEmailServiceReady() {
    if (emailServiceInitPromise) {
        return emailServiceInitPromise;
    }
    
    if (!bookingApi) {
        throw new Error('BookingApi not initialized');
    }
    
    emailServiceInitPromise = bookingApi.init().catch(error => {
        console.error('❌ Failed to initialize email service:', error.message);
        throw error;
    });
    
    return emailServiceInitPromise;
}

export default async function handler(req, res) {
    try {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type, X-Requested-With, Accept'
        );
        
        // Handle preflight
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Only allow POST
        if (req.method !== 'POST') {
            return res.status(405).json({ 
                success: false,
                error: 'Method not allowed' 
            });
        }

        // Validate request body
        const body = req.body || {};
        if (!body.name || !body.email) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, email'
            });
        }

        if (!bookingApi) {
            return res.status(503).json({
                success: false,
                error: 'Service not available'
            });
        }

        const reference = `GBB-${Date.now()}`;
        
        console.log(`📅 Booking request received: ${reference}`);
        console.log(`   Customer: ${body.name} <${body.email}>`);
        console.log(`   Service: ${body.service_name}`);
        console.log(`   Date: ${body.date} at ${body.time}`);

        try {
            // Initialize email service
            await ensureEmailServiceReady();
            
            // Handle booking and wait for emails to be sent
            const result = await bookingApi.handleBooking(body);
            
            if (result.success) {
                console.log(`✅ Booking processed: ${reference}`);
                return res.status(200).json({
                    success: true,
                    message: result.message || 'Your booking has been received! Check your email for confirmation.',
                    reference
                });
            } else {
                console.warn(`⚠️ Booking processing error: ${result.error}`);
                return res.status(400).json({
                    success: false,
                    error: result.error || 'Failed to process booking',
                    errors: result.errors
                });
            }
        } catch (error) {
            console.error(`❌ Booking processing failed (${reference}):`, error.message);
            console.error('   Full error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to process booking',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }

    } catch (error) {
        console.error('❌ Handler error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
