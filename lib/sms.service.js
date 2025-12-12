/**
 * SMS Service using Twilio
 * 
 * Handles sending SMS notifications to customers and admin
 * Integrates with Twilio API for reliable delivery
 */

import twilio from 'twilio';

class SMSService {
    constructor() {
        this.client = null;
        this.initialized = false;
        this.enabled = process.env.SMS_ENABLED === 'true';
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
        this.fromNumber = process.env.TWILIO_FROM_NUMBER;
        this.adminPhone = process.env.ADMIN_PHONE;
    }

    /**
     * Initialize Twilio client
     */
    async init() {
        if (this.initialized) return;

        if (!this.enabled) {
            console.log('ℹ️  SMS service disabled (SMS_ENABLED=false)');
            this.initialized = true;
            return;
        }

        if (!this.accountSid || !this.authToken || (!this.fromNumber && !this.messagingServiceSid)) {
            console.warn('⚠️  SMS service disabled: Missing Twilio credentials (need ACCOUNT_SID, AUTH_TOKEN, and either FROM_NUMBER or MESSAGING_SERVICE_SID)');
            this.enabled = false;
            this.initialized = true;
            return;
        }

        try {
            this.client = twilio(this.accountSid, this.authToken);
            console.log('✅ Twilio SMS service initialized');
            this.initialized = true;
        } catch (error) {
            console.error('❌ Failed to initialize Twilio client:', error.message);
            this.enabled = false;
            this.initialized = true;
        }
    }

    /**
     * Send SMS to customer
     * @param {string} phone - Customer phone number
     * @param {object} bookingDetails - Booking information
     */
    async sendCustomerSMS(phone, bookingDetails) {
        if (!this.enabled || !this.client) {
            console.log('ℹ️  SMS to customer skipped (service disabled)');
            return { success: true, skipped: true };
        }

        try {
            const message = this.formatCustomerMessage(bookingDetails);
            
            console.log(`📱 Sending SMS to customer: ${phone}`);
            const response = await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                messagingServiceSid: this.messagingServiceSid,
                to: phone
            });

            console.log(`✅ Customer SMS sent (Message SID: ${response.sid})`);
            return {
                success: true,
                messageId: response.sid,
                phone
            };
        } catch (error) {
            console.error(`❌ Failed to send customer SMS:`, error.message);
            console.error('   Phone:', phone);
            console.error('   Details:', error);
            throw error;
        }
    }

    /**
     * Send SMS to admin
     * @param {object} bookingDetails - Booking information
     */
    async sendAdminSMS(bookingDetails) {
        if (!this.enabled || !this.client || !this.adminPhone) {
            console.log('ℹ️  SMS to admin skipped (service disabled or no admin phone)');
            return { success: true, skipped: true };
        }

        try {
            const message = this.formatAdminMessage(bookingDetails);
            
            console.log(`📱 Sending SMS to admin: ${this.adminPhone}`);
            const response = await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                messagingServiceSid: this.messagingServiceSid,
                to: this.adminPhone
            });

            console.log(`✅ Admin SMS sent (Message SID: ${response.sid})`);
            return {
                success: true,
                messageId: response.sid,
                phone: this.adminPhone
            };
        } catch (error) {
            console.error(`❌ Failed to send admin SMS:`, error.message);
            console.error('   Details:', error);
            throw error;
        }
    }

    /**
     * Send both customer and admin SMS in parallel
     */
    async sendBookingSMS(bookingDetails) {
        if (!this.enabled || !this.client) {
            console.log('ℹ️  SMS notifications skipped (service disabled)');
            return { success: true, skipped: true };
        }

        try {
            console.log('📱 Sending booking SMS notifications...');
            
            const promises = [
                this.sendCustomerSMS(bookingDetails.customerPhone, bookingDetails)
            ];

            if (this.adminPhone) {
                promises.push(this.sendAdminSMS(bookingDetails));
            }

            const results = await Promise.all(promises);
            
            console.log('✅ All booking SMS sent successfully');
            return {
                success: true,
                messages: results
            };
        } catch (error) {
            console.error('❌ Failed to send booking SMS:', error.message);
            // Don't throw - SMS is supplementary to email
            // Log and continue
            return {
                success: false,
                error: error.message,
                partial: true // Some SMS may have been sent
            };
        }
    }

    /**
     * Format customer SMS message
     */
    formatCustomerMessage(details) {
        return `Hi ${details.customerName}! Your GlamorByBee booking is confirmed for ${details.bookingDate} at ${details.bookingTime}. Service: ${details.serviceSelected}. We'll see you soon! 💄`;
    }

    /**
     * Format admin SMS message
     */
    formatAdminMessage(details) {
        return `📅 NEW BOOKING: ${details.customerName} | ${details.serviceSelected} | ${details.bookingDate} ${details.bookingTime} | ${details.visitType} | Phone: ${details.customerPhone}`;
    }

    /**
     * Health check - verify Twilio connection
     */
    async healthCheck() {
        if (!this.enabled || !this.client) {
            return {
                status: 'disabled',
                message: 'SMS service is disabled'
            };
        }

        try {
            // Try to get account details to verify credentials
            const account = await this.client.api.accounts.list({ limit: 1 });
            return {
                status: 'healthy',
                message: 'SMS service is operational',
                account: account[0]?.friendlyName || 'Twilio Account'
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                message: `SMS service error: ${error.message}`
            };
        }
    }
}

export default SMSService;
