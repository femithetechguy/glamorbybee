/**
 * Email Service - Nodemailer Integration
 * 
 * Modular email sending service handling:
 * - SMTP connection via Nodemailer
 * - Email template rendering with variable replacement
 * - Admin and customer email sending
 * - Error handling and logging
 */

import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class EmailService {
    constructor(config) {
        this.config = {
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '465'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            ...config
        };
        
        this.transporter = null;
        this.templatesCache = {};
    }

    /**
     * Initialize Nodemailer transporter
     */
    async init() {
        try {
            // Check if environment variables are set
            if (!this.config.auth.user || !this.config.auth.pass) {
                const error = new Error('Email credentials not configured in environment variables');
                console.error('❌ Email configuration error:', error.message);
                console.log('⚠️  Available env vars:', Object.keys(process.env).filter(k => k.startsWith('EMAIL')));
                throw error;
            }

            this.transporter = nodemailer.createTransport(this.config);
            
            // Verify connection
            await this.transporter.verify();
            console.log('✅ Email service initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Email service initialization failed:', error.message);
            console.error('Configuration:', {
                host: this.config.host,
                port: this.config.port,
                secure: this.config.secure,
                user: this.config.auth.user ? '***' : 'NOT SET',
                pass: this.config.auth.pass ? '***' : 'NOT SET'
            });
            throw error;
        }
    }

    /**
     * Load and cache email template
     */
    async getTemplate(templateName) {
        if (this.templatesCache[templateName]) {
            return this.templatesCache[templateName];
        }

        try {
            const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
            const content = await fs.readFile(templatePath, 'utf-8');
            this.templatesCache[templateName] = content;
            return content;
        } catch (error) {
            console.error(`❌ Failed to load template ${templateName}:`, error.message);
            throw new Error(`Template not found: ${templateName}`);
        }
    }

    /**
     * Replace template variables with actual values
     */
    replaceVariables(template, variables) {
        let html = template;
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, variables[key] || '');
        });
        return html;
    }

    /**
     * Send booking confirmation email to customer
     */
    async sendCustomerEmail(customerData) {
        try {
            const {
                customerName,
                customerEmail,
                serviceSelected,
                bookingDate,
                bookingTime,
                visitType,
                bookingReference,
                serviceAddress,
                specialRequests
            } = customerData;

            const template = await this.getTemplate('customer-email');
            
            const templateVars = {
                name: customerName,
                email: customerEmail,
                service: serviceSelected,
                date: bookingDate,
                time: bookingTime,
                visitType: visitType,
                address: serviceAddress || 'N/A',
                specialRequests: specialRequests || 'None',
                reference: bookingReference,
                year: new Date().getFullYear()
            };

            const html = this.replaceVariables(template, templateVars);

            const mailOptions = {
                from: `GlamorByBee LLC <${this.config.auth.user}>`,
                to: customerEmail,
                subject: `✨ Your Glam Session is Booked! - ${serviceSelected}`,
                html: html,
                replyTo: this.config.adminEmail
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Customer email sent: ${result.messageId}`);
            return result;
        } catch (error) {
            console.error('❌ Failed to send customer email:', error.message);
            throw error;
        }
    }

    /**
     * Send admin notification email
     */
    async sendAdminEmail(bookingData) {
        try {
            const template = await this.getTemplate('admin-email');

            const templateVars = {
                name: bookingData.customerName,
                email: bookingData.customerEmail,
                phone: bookingData.customerPhone,
                service: bookingData.serviceSelected,
                date: bookingData.bookingDate,
                time: bookingData.bookingTime,
                visitType: bookingData.visitType,
                location: bookingData.serviceLocation,
                specialRequests: bookingData.specialRequests || 'None',
                reference: bookingData.bookingReference,
                submissionTime: new Date().toLocaleString(),
                year: new Date().getFullYear()
            };

            const html = this.replaceVariables(template, templateVars);

            const mailOptions = {
                from: `GlamorByBee LLC <${this.config.auth.user}>`,
                to: this.config.adminEmail,
                subject: `📅 New Booking: ${bookingData.customerName} - ${bookingData.serviceSelected}`,
                html: html,
                replyTo: bookingData.customerEmail
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Admin email sent: ${result.messageId}`);
            return result;
        } catch (error) {
            console.error('❌ Failed to send admin email:', error.message);
            throw error;
        }
    }

    /**
     * Send both customer and admin emails
     */
    async sendBookingEmails(bookingData) {
        try {
            // Generate reference number
            const reference = `GBB-${Date.now()}`;
            bookingData.bookingReference = reference;

            // Send both emails in parallel
            const [customerResult, adminResult] = await Promise.all([
                this.sendCustomerEmail(bookingData),
                this.sendAdminEmail(bookingData)
            ]);

            return {
                success: true,
                reference,
                customerEmail: customerResult.messageId,
                adminEmail: adminResult.messageId
            };
        } catch (error) {
            console.error('❌ Booking email sending failed:', error.message);
            throw error;
        }
    }

    /**
     * Health check - verify SMTP connection
     */
    async healthCheck() {
        try {
            if (!this.transporter) {
                throw new Error('Email service not initialized');
            }
            await this.transporter.verify();
            return { status: 'healthy', message: 'Email service is operational' };
        } catch (error) {
            return { status: 'unhealthy', message: error.message };
        }
    }
}

export default EmailService;
