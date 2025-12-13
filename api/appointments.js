/**
 * Appointments API Handler
 * Handles saving and retrieving appointments from JSON file
 * No database required - direct file I/O
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appointmentsFilePath = path.join(__dirname, '../json/appointments.json');

/**
 * Read appointments from JSON file
 */
export async function getAppointments() {
    try {
        const data = fs.readFileSync(appointmentsFilePath, 'utf-8');
        const parsed = JSON.parse(data);
        return {
            success: true,
            appointments: parsed.appointments || []
        };
    } catch (error) {
        console.error('Error reading appointments:', error.message);
        return {
            success: false,
            error: 'Failed to read appointments'
        };
    }
}

/**
 * Save a new appointment to JSON file
 */
export async function saveAppointment(appointmentData) {
    try {
        // Read existing appointments
        const fileContent = fs.readFileSync(appointmentsFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        // Generate unique ID if not provided (format: GBB-XXXX where last 3 are timestamp digits + 1 random)
        if (!appointmentData.id) {
            const timestampDigits = Date.now().toString().slice(-3);
            const randomDigit = Math.floor(Math.random() * 10);
            appointmentData.id = `GBB-${timestampDigits}${randomDigit}`;
        }
        
        // Add timestamp if not provided
        if (!appointmentData.created_at) {
            appointmentData.created_at = new Date().toISOString();
        }
        
        // Add status if not provided
        if (!appointmentData.status) {
            appointmentData.status = 'confirmed';
        }
        
        // Add financial fields if not provided
        if (!appointmentData.total_amount) {
            appointmentData.total_amount = 0;
        }
        
        if (!appointmentData.deposit_paid) {
            appointmentData.deposit_paid = 0;
        }
        
        if (!appointmentData.balance_due) {
            appointmentData.balance_due = appointmentData.total_amount - appointmentData.deposit_paid;
        }
        
        if (!appointmentData.payment_method) {
            appointmentData.payment_method = '';
        }
        
        // Add to appointments array
        data.appointments = data.appointments || [];
        data.appointments.push(appointmentData);
        
        // Write back to file
        fs.writeFileSync(appointmentsFilePath, JSON.stringify(data, null, 2), 'utf-8');
        
        console.log(`✅ Appointment saved: ${appointmentData.id}`);
        
        return {
            success: true,
            message: 'Appointment saved successfully',
            appointment: appointmentData
        };
    } catch (error) {
        console.error('Error saving appointment:', error.message);
        return {
            success: false,
            error: 'Failed to save appointment'
        };
    }
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(appointmentId, updateData) {
    try {
        const fileContent = fs.readFileSync(appointmentsFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        // Find and update appointment
        const index = data.appointments.findIndex(apt => apt.id === appointmentId);
        
        if (index === -1) {
            return {
                success: false,
                error: 'Appointment not found'
            };
        }
        
        // Update the appointment
        data.appointments[index] = {
            ...data.appointments[index],
            ...updateData,
            updated_at: new Date().toISOString()
        };
        
        // Write back to file
        fs.writeFileSync(appointmentsFilePath, JSON.stringify(data, null, 2), 'utf-8');
        
        console.log(`✅ Appointment updated: ${appointmentId}`);
        
        return {
            success: true,
            message: 'Appointment updated successfully',
            appointment: data.appointments[index]
        };
    } catch (error) {
        console.error('Error updating appointment:', error.message);
        return {
            success: false,
            error: 'Failed to update appointment'
        };
    }
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(appointmentId) {
    try {
        const fileContent = fs.readFileSync(appointmentsFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        // Find and remove appointment
        const index = data.appointments.findIndex(apt => apt.id === appointmentId);
        
        if (index === -1) {
            return {
                success: false,
                error: 'Appointment not found'
            };
        }
        
        data.appointments.splice(index, 1);
        
        // Write back to file
        fs.writeFileSync(appointmentsFilePath, JSON.stringify(data, null, 2), 'utf-8');
        
        console.log(`✅ Appointment deleted: ${appointmentId}`);
        
        return {
            success: true,
            message: 'Appointment deleted successfully'
        };
    } catch (error) {
        console.error('Error deleting appointment:', error.message);
        return {
            success: false,
            error: 'Failed to delete appointment'
        };
    }
}
