/**
 * Form Service - Nodemailer API Integration
 * 
 * Handles all form submission logic with Nodemailer backend
 * - Validates form data before submission
 * - Sends data to /api/booking endpoint
 * - Handles success/error responses
 * - Shows success/error messages to user
 */
class FormService {
    constructor(config) {
        this.config = {
            formSelector: '#bookingForm',
            apiEndpoint: '/api/booking',
            ...config
        };
        this.form = null;
        this.isSubmitting = false;
    }

    /**
     * Initialize FormService
     * - Setup form event listeners
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
     * Handle form submission
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        // Prevent double submission
        if (this.isSubmitting) {
            console.warn('⚠️  Form submission already in progress');
            return;
        }
        
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

        const submitBtn = this.form.querySelector('[type="submit"]');
        if (!submitBtn) return;

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        this.isSubmitting = true;

        try {
            // Sync time from external select to hidden field (failsafe)
            const timeSelect = document.getElementById('time');
            const hiddenTimeInput = document.getElementById('hidden_time');
            if (timeSelect && hiddenTimeInput) {
                hiddenTimeInput.value = timeSelect.value;
            }
            
            // Get form data
            const formData = new FormData(this.form);
            
            console.log('📧 Form data captured, sending to server...');
            
            // Prepare payload for API
            const payload = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                service_name: formData.get('service_name') || '',
                date: formData.get('date'),
                time: formData.get('time'),
                location: formData.get('location') || 'studio',
                serviceAddress: formData.get('serviceAddress') || '',
                notes: formData.get('notes') || ''
            };

            console.log('🚀 Sending booking request to API...', payload);

            // Create fetch with extended timeout (30 seconds for Vercel cold start)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            try {
                const response = await fetch(this.config.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || `Server error: ${response.status}`);
                }

                if (!result.success) {
                    throw new Error(result.error || 'Booking submission failed');
                }

                console.log('✅ Booking submitted successfully:', result);
                
                // Reset form first
                this.form.reset();
                document.querySelectorAll('.service-pill').forEach(pill => {
                    pill.classList.remove('active');
                });
                if (typeof selectedService !== 'undefined') {
                    selectedService = null;
                }
                
                // Show success message
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
            } catch (fetchError) {
                clearTimeout(timeoutId);
                
                if (fetchError.name === 'AbortError') {
                    throw new Error('Server is taking too long to respond. Your booking may still be processed. Please check your email.');
                }
                throw fetchError;
            }

        } catch (error) {
            console.error('✗ Error submitting booking:', error);
            
            // Provide user-friendly error message
            let errorMsg = '❌ Oops! Something went wrong. Please check your information and try again.';
            if (error.message) {
                errorMsg = `❌ ${error.message}`;
            }
            
            this.showError(errorMsg);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Your Look';
            this.isSubmitting = false;
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
