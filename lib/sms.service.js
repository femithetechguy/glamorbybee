/**
 * SMS Service using Telnyx
 * 
 * Handles sending SMS notifications to customers and admin
 * Supports inbound SMS via webhooks (customer replies)
 * Integrates with Telnyx API for reliable delivery
 */

import fetch from 'node-fetch';

class SMSService {
    constructor() {
        this.initialized = false;
        this.enabled = process.env.SMS_ENABLED === 'true';
        this.apiKey = process.env.TELNYX_API_KEY;
        this.fromNumber = process.env.TELNYX_FROM_NUMBER;
        this.adminPhone = process.env.ADMIN_PHONE;
        this.profileId = process.env.TELNYX_PROFILE_ID || '40019b14-af83-43ad-b281-8b19e6267f21';
        this.publicKey = process.env.TELNYX_PUBLIC_KEY || '+M6S36KBxD3Ycq1ILR4bkpvZo/VZUXGuXsIRE2tpc8M=';
        this.apiUrl = 'https://api.telnyx.com/v2/messages';
    }

    /**
     * Initialize Telnyx service
     */
    async init() {
        if (this.initialized) return;

        if (!this.enabled) {
            console.log('ℹ️  SMS service disabled (SMS_ENABLED=false)');
            this.initialized = true;
            return;
        }

        if (!this.apiKey || !this.fromNumber) {
            console.warn('⚠️  SMS service disabled: Missing Telnyx credentials (TELNYX_API_KEY and TELNYX_FROM_NUMBER required)');
            this.enabled = false;
            this.initialized = true;
            return;
        }

        try {
            console.log('✅ Telnyx SMS service initialized');
            this.initialized = true;
        } catch (error) {
            console.error('❌ Failed to initialize Telnyx service:', error.message);
            this.enabled = false;
            this.initialized = true;
        }
    }

    /**
     * Send SMS via Telnyx REST API
     * @private
     */
    async sendSMS(toNumber, message) {
        try {
            // Use shared campaign for immediate SMS delivery without 10DLC registration
            // Remove messaging_profile_id to use Telnyx's shared campaign
            const payload = {
                from: this.fromNumber,
                to: toNumber,
                text: message
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`Telnyx API error: ${data.errors?.[0]?.detail || data.message || 'Unknown error'}`);
            }

            return {
                success: true,
                messageId: data.data.id,
                to: toNumber
            };
        } catch (error) {
            console.error(`❌ Failed to send SMS to ${toNumber}:`, error.message);
            throw error;
        }
    }

    /**
     * Send SMS to customer
     * @param {string} phone - Customer phone number
     * @param {object} bookingDetails - Booking information
     */
    async sendCustomerSMS(phone, bookingDetails) {
        if (!this.enabled || !this.apiKey) {
            console.log('ℹ️  SMS to customer skipped (service disabled)');
            return { success: true, skipped: true };
        }

        try {
            const message = this.formatCustomerMessage(bookingDetails);
            
            console.log(`📱 Sending SMS to customer: ${phone}`);
            const result = await this.sendSMS(phone, message);
            console.log(`✅ Customer SMS sent (Message ID: ${result.messageId})`);
            return result;
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
        if (!this.enabled || !this.apiKey || !this.adminPhone) {
            console.log('ℹ️  SMS to admin skipped (service disabled or no admin phone)');
            return { success: true, skipped: true };
        }

        try {
            const message = this.formatAdminMessage(bookingDetails);
            
            console.log(`📱 Sending SMS to admin: ${this.adminPhone}`);
            const result = await this.sendSMS(this.adminPhone, message);
            console.log(`✅ Admin SMS sent (Message ID: ${result.messageId})`);
            return result;
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
        if (!this.enabled || !this.apiKey) {
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
     * Health check - verify Telnyx connection
     */
    async healthCheck() {
        if (!this.enabled || !this.apiKey) {
            return {
                status: 'disabled',
                message: 'SMS service is disabled'
            };
        }

        try {
            // Try to verify credentials by making a simple API call
            const response = await fetch('https://api.telnyx.com/v2/balance', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                return {
                    status: 'unhealthy',
                    message: `Invalid or expired Telnyx API key (${response.status})`
                };
            }

            const data = await response.json();
            return {
                status: 'healthy',
                message: 'SMS service is operational',
                balance: data.data?.balance || 'N/A'
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                message: `SMS service error: ${error.message}`
            };
        }
    }

    /**
     * Handle inbound SMS webhook from Telnyx
     * @param {object} webhookData - Data from Telnyx webhook
     */
    async handleInboundSMS(webhookData) {
        try {
            const event = webhookData.data;
            
            if (event.type !== 'message.received') {
                return { success: false, message: 'Not an inbound message event' };
            }

            const inboundMessage = {
                messageId: event.id,
                from: event.from.phone_number,
                to: event.to[0].phone_number,
                text: event.text,
                receivedAt: event.received_at,
                profileId: event.messaging_profile_id
            };

            console.log('📨 Inbound SMS received:', {
                from: inboundMessage.from,
                text: inboundMessage.text,
                time: inboundMessage.receivedAt
            });

            return {
                success: true,
                message: 'Inbound SMS processed',
                data: inboundMessage
            };
        } catch (error) {
            console.error('❌ Failed to process inbound SMS:', error.message);
            throw error;
        }
    }

    /**
     * Verify webhook signature from Telnyx
     * @param {string} body - Raw webhook body
     * @param {string} signature - Telnyx signature header
     */
    verifyWebhookSignature(body, signature) {
        // Note: Full verification requires crypto operations
        // For now, this is a placeholder
        // Implement using Telnyx's public key if needed
        console.log('📝 Webhook signature verification requested');
        return true; // Simplified for now
    }
}

export default SMSService;
