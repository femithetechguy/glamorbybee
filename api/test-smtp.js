/**
 * Vercel Serverless Function: GET /api/test-smtp
 * Tests SMTP connection and credentials
 * Remove this after debugging!
 */

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    try {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        console.log('🧪 Testing SMTP connection...');
        console.log('Environment variables:', {
            EMAIL_HOST: process.env.EMAIL_HOST,
            EMAIL_PORT: process.env.EMAIL_PORT,
            EMAIL_USER: process.env.EMAIL_USER,
            EMAIL_SECURE: process.env.EMAIL_SECURE,
            EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '***SET***' : '❌ NOT SET'
        });

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '465'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        console.log('📧 Attempting SMTP verification...');
        
        // Try to verify connection
        const verified = await transporter.verify();
        
        if (verified) {
            console.log('✅ SMTP connection verified successfully!');
            return res.status(200).json({
                success: true,
                message: 'SMTP connection verified!',
                config: {
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    secure: process.env.EMAIL_SECURE,
                    user: process.env.EMAIL_USER
                }
            });
        } else {
            return res.status(200).json({
                success: false,
                message: 'SMTP verification returned false'
            });
        }
    } catch (error) {
        console.error('❌ SMTP Test Failed:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', error);
        
        return res.status(200).json({
            success: false,
            error: error.message,
            code: error.code,
            details: {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: process.env.EMAIL_SECURE,
                user: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '***' : 'NOT SET'
            }
        });
    }
}
