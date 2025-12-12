/**
 * Booking API Route
 * 
 * Handles POST requests for booking form submissions
 * - Validates required fields and email format
 * - Validates contact type and booking details
 * - Calls email service to send confirmation emails
 * - Calls SMS service to send booking notifications (if enabled)
 * - Returns success/error response
 */

import EmailService from '../lib/email.service.js';
import SMSService from '../lib/sms.service.js';

/**
 * Factory function to create BookingApi instance
 */
function createBookingApi() {
    const emailService = new EmailService();
    const smsService = new SMSService();

    return {
        emailService,
        smsService,

        /**
         * Initialize email and SMS services
         */
        async init() {
            try {
                await this.emailService.init();
                await this.smsService.init();
            } catch (error) {
                console.error('Failed to initialize services:', error);
                throw error;
            }
        },

        /**
         * Validate email format
         */
        isValidEmail(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        },

        /**
         * Validate phone format (basic check)
         */
        isValidPhone(phone) {
            return phone && phone.trim().length >= 7;
        },

        /**
         * Validate booking data
         */
        validateBookingData(data) {
            const errors = [];

            // Check required fields
            if (!data.name || !data.name.trim()) {
                errors.push('Name is required');
            }

            if (!data.email || !data.email.trim()) {
                errors.push('Email is required');
            } else if (!this.isValidEmail(data.email)) {
                errors.push('Invalid email format');
            }

            if (!data.phone || !data.phone.trim()) {
                errors.push('Phone number is required');
            } else if (!this.isValidPhone(data.phone)) {
                errors.push('Invalid phone number');
            }

            if (!data.service_name || !data.service_name.trim()) {
                errors.push('Service is required');
            }

            if (!data.date || !data.date.trim()) {
                errors.push('Date is required');
            }

            if (!data.time || !data.time.trim()) {
                errors.push('Time is required');
            }

            if (!data.location || !data.location.trim()) {
                errors.push('Location/Visit type is required');
            }

            return {
                isValid: errors.length === 0,
                errors
            };
        },

        /**
         * Handle booking submission
         */
        async handleBooking(data) {
            try {
                // Validate input data
                const validation = this.validateBookingData(data);
                if (!validation.isValid) {
                    return {
                        success: false,
                        errors: validation.errors
                    };
                }

                // Prepare booking details with correct key mapping for email service
                const bookingDetails = {
                    customerName: data.name.trim(),
                    customerEmail: data.email.trim(),
                    customerPhone: data.phone.trim(),
                    serviceSelected: data.service_name.trim(),
                    bookingDate: data.date.trim(),
                    bookingTime: data.time.trim(),
                    visitType: data.location.trim(),
                    serviceLocation: data.location.trim(),
                    serviceAddress: data.serviceAddress?.trim() || '',
                    specialRequests: data.notes?.trim() || data.specialRequests?.trim() || ''
                };

                // Send emails and wait for completion
                // On Vercel, we must wait before function execution ends
                try {
                    console.log('📧 Sending booking emails...');
                    await this.emailService.sendBookingEmails(bookingDetails);
                    console.log('✅ Booking emails sent successfully');
                } catch (error) {
                    console.error('❌ CRITICAL: Failed to send booking emails:', error.message);
                    console.error('   Details:', error);
                    // Don't throw - still return success since booking was created
                    // User was notified via response message
                }

                // Send SMS notifications (non-blocking failure)
                try {
                    if (this.smsService && process.env.SMS_ENABLED === 'true') {
                        console.log('📱 Sending SMS notifications...');
                        await this.smsService.sendBookingSMS(bookingDetails);
                        console.log('✅ SMS notifications sent');
                    }
                } catch (error) {
                    // SMS is supplementary - log but don't fail the booking
                    console.warn('⚠️ SMS notification failed (non-critical):', error.message);
                }

                return {
                    success: true,
                    message: 'Booking submitted successfully! Check your email for confirmation.'
                };
            } catch (error) {
                console.error('Error processing booking:', error);
                return {
                    success: false,
                    error: 'Failed to process booking. Please try again later.'
                };
            }
        },

        /**
         * Health check endpoint
         */
        async healthCheck() {
            try {
                const status = await this.emailService.healthCheck();
                return {
                    status: status.status === 'healthy' ? 'operational' : 'error',
                    message: status.message
                };
            } catch (error) {
                return {
                    status: 'error',
                    message: 'Email service health check failed'
                };
            }
        }
    };
}

export default createBookingApi;
