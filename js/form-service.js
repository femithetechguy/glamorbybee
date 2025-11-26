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
     * Show success message
     */
    showSuccess(message) {
        console.log('🎉 showSuccess called with message:', message);
        
        const successAlert = document.getElementById('successAlert');
        console.log('✓ successAlert element found:', !!successAlert);
        
        if (successAlert) {
            console.log('📝 Setting innerHTML to:', message);
            successAlert.innerHTML = `<i class="bi bi-check-circle-fill"></i> <strong>${message}</strong>`;
            console.log('✓ innerHTML set successfully');
            
            console.log('🔴 Removing d-none class');
            successAlert.classList.remove('d-none');
            successAlert.style.display = 'flex';
            successAlert.style.visibility = 'visible';
            successAlert.style.opacity = '1';
            successAlert.classList.add('celebrate-animation');
            console.log('✓ d-none class removed, classes now:', successAlert.className);
            
            // Scroll the alert into view
            console.log('📱 Scrolling alert into view');
            setTimeout(() => {
                successAlert.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            
            // Keep visible for 12 seconds then dissolve out
            console.log('⏱️ Setting timeout for 12 seconds');
            setTimeout(() => {
                console.log('⏰ Timeout reached, dissolving alert');
                successAlert.classList.add('dissolve-out');
                setTimeout(() => {
                    successAlert.classList.add('d-none');
                    successAlert.classList.remove('dissolve-out');
                }, 600); // Match dissolve animation duration
            }, 12000);
        } else {
            console.warn('⚠️ successAlert element NOT FOUND, using fallback alert');
            alert(`✅ ${message}`);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        console.log('❌ showError called with message:', message);
        
        const errorAlert = document.getElementById('errorAlert');
        const errorMsg = document.getElementById('errorMsg');
        
        console.log('✓ errorAlert element found:', !!errorAlert);
        console.log('✓ errorMsg element found:', !!errorMsg);
        
        if (errorAlert && errorMsg) {
            console.log('📝 Setting errorMsg innerHTML to:', message);
            errorMsg.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i> ${message}`;
            console.log('✓ errorMsg innerHTML set successfully');
            
            console.log('🔴 Removing d-none class from errorAlert');
            errorAlert.classList.remove('d-none');
            console.log('✓ d-none class removed, classes now:', errorAlert.className);
            
            // Scroll into view
            console.log('📱 Scrolling into view');
            errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Keep visible for 10 seconds
            console.log('⏱️ Setting timeout for 10 seconds');
            setTimeout(() => {
                console.log('⏰ Timeout reached, hiding alert');
                errorAlert.classList.add('d-none');
            }, 10000);
        } else {
            console.warn('⚠️ errorAlert or errorMsg element NOT FOUND, using fallback alert');
            // Fallback: show alert if element not found
            alert(`❌ ${message}`);
        }
    }
}
