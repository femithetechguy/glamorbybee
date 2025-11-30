/**
 * Form Service - EmailJS Integration
 * 
 * Handles all form submission logic with EmailJS
 * - Loads EmailJS library dynamically if needed
 * - Initializes EmailJS with credentials
 * - Handles form submission and validation
 * - Shows success/error messages
 */
class FormService {
    constructor(config) {
        this.config = {
            formSelector: '#bookingForm',
            emailJSServiceId: 'fttg_service',
            emailJSTemplateId: 'template_glamorbybee',
            emailJSPublicKey: 'ANmN0gWxEnEHgUCXx',
            ...config
        };
        this.form = null;
        this.emailjsLoaded = false;
    }

    /**
     * Initialize FormService
     * - Setup form event listeners
     * - EmailJS is already initialized in HTML script tag
     */
    async init() {
        console.log('📧 FormService initializing...');
        
        // Setup form
        this.form = document.querySelector(this.config.formSelector);
        if (!this.form) {
            console.error('❌ Form not found:', this.config.formSelector);
            return;
        }
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        console.log('✓ FormService initialized');
    }

    /**
     * Initialize EmailJS with public key
     */
    // EmailJS is already initialized in HTML script tag

    /**
     * Handle form submission
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        console.log('✉️ Form submitted');
        
        // Check if service is selected from the dropdown
        const servicePills = document.getElementById('servicePills');
        if (!servicePills || !servicePills.value || servicePills.value.trim() === '') {
            console.warn('⚠️ Service not selected');
            this.showError('⚠️ Please select a service before booking');
            return;
        }
        
        // Validate email
        const emailInput = document.getElementById('email');
        const emailValue = emailInput ? emailInput.value.trim() : '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailValue || !emailRegex.test(emailValue)) {
            console.warn('⚠️ Invalid email address');
            this.showError('⚠️ Please provide a valid email address');
            return;
        }
        
        // Validate phone
        const phoneInput = document.getElementById('phone');
        const phoneValue = phoneInput ? phoneInput.value.trim() : '';
        if (!phoneValue) {
            console.warn('⚠️ Phone number missing');
            this.showError('⚠️ Please provide a phone number');
            return;
        }

        // Validate date
        const dateInput = document.getElementById('date');
        const dateValue = dateInput ? dateInput.value.trim() : '';
        if (!dateValue) {
            console.warn('⚠️ Date not selected');
            this.showError('⚠️ Please select a date before booking');
            return;
        }

        // Validate time
        const timeSelect = document.getElementById('time');
        const timeValue = timeSelect ? timeSelect.value.trim() : '';
        if (!timeValue) {
            console.warn('⚠️ Time not selected');
            this.showError('⚠️ Please select a time before booking');
            return;
        }

        // Check if EmailJS is available
        if (typeof emailjs === 'undefined') {
            console.error('❌ EmailJS not available');
            this.showError('Email service is loading. Please try again in a moment.');
            return;
        }

        const submitBtn = this.form.querySelector('[type="submit"]');
        if (!submitBtn) return;

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            // Sync time from external select to hidden field (failsafe)
            const timeSelect = document.getElementById('time');
            const hiddenTimeInput = document.getElementById('hidden_time');
            if (timeSelect && hiddenTimeInput) {
                hiddenTimeInput.value = timeSelect.value;
            }
            
            // Get form data
            const formData = new FormData(this.form);
            
            console.log('📧 Form data captured, preparing email...');
            
            // Prepare template parameters
            // Format date as Month Day, Year (e.g., December 26, 2025)
            const dateStr = formData.get('date');
            let formattedDate = '';
            if (dateStr) {
                const dateObj = new Date(dateStr + 'T00:00:00');
                formattedDate = dateObj.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
            
            // Add timezone to time (e.g., 2:00 PM CST)
            const timeStr = formData.get('time');
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const tzAbbr = new Date().toLocaleDateString('en-US', { timeZoneName: 'short' }).split(' ').pop();
            const formattedTime = timeStr ? `${timeStr} ${tzAbbr}` : '';
            
            const templateParams = {
                recipient_email: formData.get('email'), // Customer email - primary recipient
                reply_to_email: formData.get('email'), // Where replies go (back to customer)
                from_name: `${formData.get('name')}: ${formattedDate} - ${formData.get('location') === 'studio' ? 'Studio Visit' : 'Home Service'}`, // From name with details
                customer_name: formData.get('name'),
                customer_email: formData.get('email'),
                staff_email: appData?.site?.emailjs?.staffEmail || 'femithetechguy@gmail.com', // Staff receives BCC
                selected_service: formData.get('service_name') || 'Not selected',
                booking_date: formattedDate,
                booking_time: formattedTime,
                visit_type: formData.get('location') === 'studio' ? 'Studio Visit' : 'Home Service',
                service_location: formData.get('location') === 'home' ? (formData.get('serviceAddress') || '') : 'N/A (Studio Visit)',
                customer_phone: formData.get('phone'),
                special_requests: formData.get('notes') || 'No special requests'
            };

            console.log('🚀 Sending email with params:', templateParams);

            // Send email
            const response = await emailjs.send(
                this.config.emailJSServiceId,
                this.config.emailJSTemplateId,
                templateParams
            );

            console.log('✅ Email sent successfully:', response);
            
            // Reset form first
            this.form.reset();
            document.querySelectorAll('.service-pill').forEach(pill => {
                pill.classList.remove('active');
            });
            if (typeof selectedService !== 'undefined') {
                selectedService = null;
            }
            
            // Show success message BEFORE scrolling
            const email = formData.get('email');
            const phone = formData.get('phone');
            let contactMessage = 'Our staff will get in touch with you shortly at ';
            
            if (email && phone) {
                contactMessage += `${email} or ${phone}`;
            } else if (email) {
                contactMessage += email;
            } else if (phone) {
                contactMessage += phone;
            }
            
            this.showSuccess(`Your Glam Session has been booked! ${contactMessage}`);
            
            // Add animation effect after 6 seconds
            setTimeout(() => {
                const successAlert = document.getElementById('successAlert');
                if (successAlert) {
                    successAlert.style.animation = 'pulse 1.5s ease-in-out infinite';
                }
            }, 6000);

        } catch (error) {
            console.error('✗ Error sending email:', error);
            console.error('📋 Error details:', {
                message: error.message,
                status: error.status,
                text: error.text,
                name: error.name
            });
            
            // Provide specific error message based on error type
            let errorMsg = '❌ Oops! Something went wrong. Please check your information and try again.';
            if (error.message && error.message.includes('service')) {
                errorMsg = '❌ Email service error. Please try again in a moment.';
            } else if (error.status) {
                errorMsg = `❌ Error (${error.status}): Please try again.`;
            }
            
            this.showError(errorMsg);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Your Look';
        }
    }

    /**
     * Show success message - using custom modal
     */
    showSuccess(message) {
        console.log('🎉 showSuccess called with message:', message);
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'bookingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 2rem;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 8px 32px rgba(214, 51, 132, 0.2);
            animation: slideUp 0.3s ease-out;
        `;

        modal.innerHTML = `
            <i class="bi bi-check-circle-fill" style="color: #10b981; font-size: 3rem; display: block; margin-bottom: 1rem;"></i>
            <h3 style="color: #0f0f0f; margin-bottom: 0.5rem; font-family: 'Space Grotesk', sans-serif; font-weight: 700;">Booking Confirmed!</h3>
            <p style="color: #666; margin-bottom: 1.5rem; line-height: 1.5;">${message}</p>
            <button onclick="document.getElementById('bookingOverlay').remove()" style="
                background: #d63384;
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 1rem;
                transition: 0.3s;
            " onmouseover="this.style.background='#c0227a'" onmouseout="this.style.background='#d63384'">OK</button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Add animation keyframes if not already present
        if (!document.getElementById('bookingAnimation')) {
            const style = document.createElement('style');
            style.id = 'bookingAnimation';
            style.textContent = `
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        console.log('✓ Modal displayed successfully');
    }

    /**
     * Show error message - using custom modal
     */
    showError(message) {
        console.log('❌ showError called with message:', message);
        
        // Remove emoji prefix if present
        const cleanMessage = message.replace(/^[⚠️❌]/g, '').trim();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'errorOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 2rem;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 8px 32px rgba(239, 68, 68, 0.2);
            border-left: 5px solid #ef4444;
            animation: slideUp 0.3s ease-out;
        `;

        modal.innerHTML = `
            <i class="bi bi-exclamation-circle-fill" style="color: #ef4444; font-size: 3rem; display: block; margin-bottom: 1rem;"></i>
            <h3 style="color: #0f0f0f; margin-bottom: 0.5rem; font-family: 'Space Grotesk', sans-serif; font-weight: 700;">Oops!</h3>
            <p style="color: #666; margin-bottom: 1.5rem; line-height: 1.5;">${cleanMessage}</p>
            <button onclick="document.getElementById('errorOverlay').remove()" style="
                background: #ef4444;
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 1rem;
                transition: 0.3s;
            " onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">Try Again</button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Add animation keyframes if not already present
        if (!document.getElementById('bookingAnimation')) {
            const style = document.createElement('style');
            style.id = 'bookingAnimation';
            style.textContent = `
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        console.log('✓ Error modal displayed successfully');
    }
}
