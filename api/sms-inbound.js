/**
 * SMS Inbound Webhook Handler
 * 
 * Receives inbound SMS messages from Telnyx
 * Stores messages for viewing in admin panel
 * Can trigger auto-responses or notifications
 */

import SMSService from '../lib/sms.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesFile = path.join(__dirname, '../json/inbound_messages.json');

/**
 * Load inbound messages from JSON file
 */
function loadMessages() {
    try {
        if (fs.existsSync(messagesFile)) {
            const data = fs.readFileSync(messagesFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
    return { messages: [] };
}

/**
 * Save inbound messages to JSON file
 */
function saveMessages(data) {
    try {
        fs.writeFileSync(messagesFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving messages:', error);
    }
}

/**
 * Factory function to create SMS Inbound API handler
 */
function createSMSInboundApi() {
    const smsService = new SMSService();

    return {
        smsService,

        /**
         * Initialize SMS service
         */
        async init() {
            try {
                await this.smsService.init();
            } catch (error) {
                console.error('Failed to initialize SMS service:', error);
            }
        },

        /**
         * Handle inbound SMS webhook from Telnyx
         */
        async handleWebhook(req) {
            try {
                const webhookData = req.body;

                // Process the inbound message
                const result = await this.smsService.handleInboundSMS(webhookData);

                if (result.success) {
                    // Store message for retrieval
                    const messages = loadMessages();
                    messages.messages.push({
                        ...result.data,
                        storedAt: new Date().toISOString(),
                        read: false
                    });
                    saveMessages(messages);

                    console.log('✅ Inbound message stored');
                }

                return {
                    success: result.success,
                    message: result.message
                };
            } catch (error) {
                console.error('❌ Webhook processing failed:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        /**
         * Get all inbound messages
         */
        getMessages() {
            return loadMessages();
        },

        /**
         * Get unread messages count
         */
        getUnreadCount() {
            const data = loadMessages();
            return data.messages.filter(m => !m.read).length;
        },

        /**
         * Mark message as read
         */
        markAsRead(messageId) {
            const data = loadMessages();
            const message = data.messages.find(m => m.messageId === messageId);
            if (message) {
                message.read = true;
                saveMessages(data);
                return true;
            }
            return false;
        },

        /**
         * Delete a message
         */
        deleteMessage(messageId) {
            const data = loadMessages();
            data.messages = data.messages.filter(m => m.messageId !== messageId);
            saveMessages(data);
            return true;
        }
    };
}

export default createSMSInboundApi;
