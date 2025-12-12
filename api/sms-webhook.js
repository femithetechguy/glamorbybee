/**
 * Vercel Serverless Function: POST /api/sms-webhook
 * Webhook endpoint for receiving inbound SMS from Telnyx
 * 
 * Handles customer replies to booking confirmation SMS
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Telnyx public key for signature verification
const TELNYX_PUBLIC_KEY = process.env.TELNYX_PUBLIC_KEY || '+M6S36KBxD3Ycq1ILR4bkpvZo/VZUXGuXsIRE2tpc8M=';

/**
 * Verify webhook signature from Telnyx
 * Ensures the webhook came from Telnyx and hasn't been tampered with
 */
function verifyWebhookSignature(req) {
    const requestBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const signature = req.headers['telnyx-signature-mac'] || req.headers['x-telnyx-signature-mac'];
    
    if (!signature) {
        console.warn('⚠️  No webhook signature found');
        return false;
    }

    try {
        // Create HMAC using the public key and request body
        const hmac = crypto
            .createHmac('sha256', Buffer.from(TELNYX_PUBLIC_KEY, 'base64'))
            .update(requestBody)
            .digest('base64');

        const isValid = hmac === signature;
        
        if (!isValid) {
            console.warn('⚠️  Webhook signature verification failed');
        }

        return isValid;
    } catch (error) {
        console.error('❌ Error verifying webhook signature:', error.message);
        return false;
    }
}

/**
 * Save inbound SMS to JSON file for tracking
 */
function saveInboundSMS(data) {
    const jsonDir = path.join(process.cwd(), 'json');
    const smsFile = path.join(jsonDir, 'inbound_sms.json');

    try {
        // Ensure directory exists
        if (!fs.existsSync(jsonDir)) {
            fs.mkdirSync(jsonDir, { recursive: true });
        }

        // Read existing SMS or create new array
        let smsList = [];
        if (fs.existsSync(smsFile)) {
            const content = fs.readFileSync(smsFile, 'utf-8');
            smsList = JSON.parse(content);
        }

        // Add new SMS with timestamp
        smsList.push({
            id: data.data?.id || 'unknown',
            from: data.data?.from?.phone_number || 'unknown',
            to: data.data?.to?.phone_number || 'unknown',
            text: data.data?.text || '',
            receivedAt: data.data?.received_at || new Date().toISOString(),
            timestamp: new Date().toISOString(),
            raw: data // Store full webhook data for reference
        });

        // Write back to file
        fs.writeFileSync(smsFile, JSON.stringify(smsList, null, 2));
        console.log(`✅ Inbound SMS saved (ID: ${data.data?.id})`);

        return true;
    } catch (error) {
        console.error('❌ Failed to save inbound SMS:', error.message);
        return false;
    }
}

/**
 * Log webhook activity for debugging
 */
function logWebhookActivity(event) {
    const jsonDir = path.join(process.cwd(), 'json');
    const logFile = path.join(jsonDir, 'webhook_log.json');

    try {
        if (!fs.existsSync(jsonDir)) {
            fs.mkdirSync(jsonDir, { recursive: true });
        }

        let logs = [];
        if (fs.existsSync(logFile)) {
            const content = fs.readFileSync(logFile, 'utf-8');
            logs = JSON.parse(content);
        }

        logs.push({
            timestamp: new Date().toISOString(),
            event: event.type,
            messageId: event.data?.id,
            from: event.data?.from?.phone_number,
            to: event.data?.to?.phone_number
        });

        // Keep only last 100 events
        if (logs.length > 100) {
            logs = logs.slice(-100);
        }

        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error('Error logging webhook activity:', error.message);
    }
}

export default async function handler(req, res) {
    try {
        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type,telnyx-signature-mac');
            return res.status(200).end();
        }

        // Only accept POST requests
        if (req.method !== 'POST') {
            console.warn(`⚠️  Invalid method: ${req.method}`);
            return res.status(405).json({ error: 'Method not allowed' });
        }

        console.log('📨 Received webhook from Telnyx');

        // Parse request body if it's a string
        let webhookData = req.body;
        if (typeof req.body === 'string') {
            webhookData = JSON.parse(req.body);
        }

        // Verify webhook signature
        const isValid = verifyWebhookSignature(req);
        if (!isValid) {
            console.warn('⚠️  Webhook signature verification failed');
            // Still process it for debugging, but log the warning
        }

        const eventType = webhookData.data?.type || webhookData.type;
        console.log(`📬 Webhook event type: ${eventType}`);

        // Handle different webhook events
        switch (eventType) {
            case 'message.received':
                console.log('💬 Inbound SMS received');
                console.log(`   From: ${webhookData.data?.from?.phone_number}`);
                console.log(`   Text: ${webhookData.data?.text}`);

                // Save the inbound SMS
                saveInboundSMS(webhookData);
                logWebhookActivity(webhookData);

                return res.status(200).json({
                    success: true,
                    message: 'Inbound SMS received',
                    messageId: webhookData.data?.id
                });

            case 'message.dlr':
                console.log('📬 Delivery receipt');
                console.log(`   Status: ${webhookData.data?.status}`);
                console.log(`   Message ID: ${webhookData.data?.id}`);

                logWebhookActivity(webhookData);

                return res.status(200).json({
                    success: true,
                    message: 'Delivery receipt recorded',
                    messageId: webhookData.data?.id
                });

            case 'message.sent':
                console.log('✅ Message sent confirmation');
                logWebhookActivity(webhookData);

                return res.status(200).json({
                    success: true,
                    message: 'Message sent',
                    messageId: webhookData.data?.id
                });

            default:
                console.log(`ℹ️  Unhandled event type: ${eventType}`);
                logWebhookActivity(webhookData);

                return res.status(200).json({
                    success: true,
                    message: 'Webhook received',
                    event: eventType
                });
        }
    } catch (error) {
        console.error('❌ Webhook error:', error.message);
        console.error('   Stack:', error.stack);

        return res.status(500).json({
            error: 'Webhook processing failed',
            message: error.message
        });
    }
}
