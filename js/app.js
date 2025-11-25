// ============================================
// GLAMORBYBEE - MODERN BOOKING APP
// 2025 - Fresh, Fast, Flawless
// ============================================

console.log('✓ app.js loaded');

let appData = {};
let selectedService = null;

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    console.log('✓ DOMContentLoaded fired');
    await initializeApp();
});

async function initializeApp() {
    try {
        console.log('✓ initializeApp started');
        
        // Load JSON data
        console.log('About to fetch JSON...');
        const response = await fetch('json/app.json');
        console.log('Fetch response status:', response.status);
        
        appData = await response.json();
        console.log('✓ JSON loaded:', appData);
        console.log('Contact data:', appData.site.contact);
        
        // Initialize EmailJS (only if credentials are configured)
        if (appData.site.emailjs.publicKey && !appData.site.emailjs.publicKey.includes('YOUR_')) {
            emailjs.init(appData.site.emailjs.publicKey);
            console.log('✓ EmailJS initialized');
        } else {
            console.warn('⚠ EmailJS credentials not configured');
        }
        
        // Populate page content
        console.log('About to call populatePageContent...');
        populatePageContent();
        populateServicePills();
        populateServicesGrid();
        populateTimeSlots();
        populateGallery();
        
        // Setup form handling
        setupFormHandling();
        
        // Set minimum date to today
        setMinDate();
        
        console.log('✓ App initialized successfully');
    } catch (error) {
        console.error('✗ Error initializing app:', error);
        console.error('Error stack:', error.stack);
        showErrorAlert('Error loading application. Please refresh.');
    }
}

// Populate Page Content
function populatePageContent() {
    console.log('populatePageContent called');
    console.log('appData:', appData);
    
    // Hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const existingH1 = heroContent.querySelector('h1');
        const existingP = heroContent.querySelector('.hero-subtitle');
        if (existingH1) existingH1.textContent = appData.site.title || 'GlamorByBee';
        if (existingP) existingP.textContent = appData.site.description || 'Professional makeup artistry';
    }

    // About section (if exists)
    const aboutSection = document.querySelector('[data-section="about"]');
    if (aboutSection) {
        aboutSection.innerHTML = `<h2>${appData.about.title}</h2><p>${appData.about.description}</p>`;
    }

    // Contact section
    console.log('Processing contact section...');
    console.log('appData.site.contact exists?', appData.site && appData.site.contact ? 'YES' : 'NO');
    
    if (appData.site.contact) {
        console.log('Contact object:', appData.site.contact);
        
        const contactLocation = document.getElementById('contactLocation');
        const contactPhone = document.getElementById('contactPhone');
        const contactEmail = document.getElementById('contactEmail');
        const contactInstagram = document.getElementById('contactInstagram');

        console.log('contactLocation element found?', contactLocation ? 'YES' : 'NO');
        console.log('contactPhone element found?', contactPhone ? 'YES' : 'NO');
        console.log('contactEmail element found?', contactEmail ? 'YES' : 'NO');
        console.log('contactInstagram element found?', contactInstagram ? 'YES' : 'NO');

        if (contactLocation) {
            contactLocation.textContent = appData.site.contact.location || 'Location';
            console.log('Set contactLocation to:', contactLocation.textContent);
        }
        if (contactPhone) {
            contactPhone.textContent = appData.site.contact.phone || 'Phone';
            console.log('Set contactPhone to:', contactPhone.textContent);
        }
        if (contactEmail) {
            contactEmail.textContent = appData.site.contact.email || 'Email';
            console.log('Set contactEmail to:', contactEmail.textContent);
        }
        if (contactInstagram) {
            contactInstagram.href = appData.site.contact.instagram;
            contactInstagram.textContent = '@glamor_bybee';
            console.log('Set contactInstagram to:', contactInstagram.textContent);
        }
    }

    // Footer contact info
    const footerEmail = document.getElementById('footerEmail');
    const footerPhone = document.getElementById('footerPhone');
    if (footerEmail) footerEmail.innerHTML = `<strong>Email:</strong> <a href="mailto:${appData.site.contact.email}">${appData.site.contact.email}</a>`;
    if (footerPhone) footerPhone.innerHTML = `<strong>Phone:</strong> <a href="tel:${appData.site.contact.phone.replace(/\D/g, '')}">${appData.site.contact.phone}</a>`;

    // Booking policy
    const bookingPolicy = document.getElementById('bookingPolicy');
    if (bookingPolicy) bookingPolicy.textContent = appData.booking.cancellationPolicy;

    // Footer Instagram
    const instagramLink = document.querySelector('[href*="instagram"]');
    if (instagramLink && appData.site.contact.instagram) {
        instagramLink.href = appData.site.contact.instagram;
    }

    // App Development info
    if (appData.appdev) {
        const appdevLink = document.getElementById('appdevLink');
        if (appdevLink) {
            appdevLink.href = `https://${appData.appdev.website}`;
            appdevLink.textContent = appData.appdev.name;
        }
    }
}

// Populate Services Grid
function populateServicesGrid() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid || !appData.services) return;

    servicesGrid.innerHTML = '';
    
    appData.services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <img src="${service.image}" alt="${service.name}" class="service-image" loading="lazy">
            <div class="service-body">
                <div class="service-price">$${service.price}</div>
                <h4 class="service-name">${service.name}</h4>
                <p class="service-desc">${service.description}</p>
                <div class="service-meta">
                    <span><i class="bi bi-clock"></i> ${service.duration}</span>
                </div>
                <div class="service-feature">
                    <ul>
                        ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        servicesGrid.appendChild(card);
    });
}

// Populate Service Pills
function populateServicePills() {
    const servicePillsContainer = document.getElementById('servicePills');
    if (!servicePillsContainer || !appData.services) return;

    servicePillsContainer.innerHTML = '';
    
    appData.services.forEach(service => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'service-pill';
        pill.dataset.serviceId = service.id;
        pill.innerHTML = `
            ${service.name}
            <span class="service-pill-price">${service.price}</span>
        `;
        
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            selectService(service, pill);
        });
        
        servicePillsContainer.appendChild(pill);
    });
}

// Select Service
function selectService(service, pillElement) {
    // Remove active class from all pills
    document.querySelectorAll('.service-pill').forEach(pill => {
        pill.classList.remove('active');
    });
    
    // Add active class to clicked pill
    pillElement.classList.add('active');
    
    // Store selected service
    selectedService = service;
    
    // Set hidden input
    const serviceInput = document.getElementById('service_name');
    if (serviceInput) {
        serviceInput.value = service.name;
    }
    
    // Scroll to date/time section
    const dateSection = document.querySelector('[data-step="2"]');
    if (dateSection) {
        dateSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Populate Time Slots
function populateTimeSlots() {
    const timeSelect = document.getElementById('time');
    if (!timeSelect || !appData.booking || !appData.booking.timeSlots) return;

    timeSelect.innerHTML = '<option value="">Select a time...</option>';
    
    appData.booking.timeSlots.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    });
}

// Populate Gallery
function populateGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid || !appData.gallery) return;

    galleryGrid.innerHTML = '';
    
    appData.gallery.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${item.image}" alt="${item.alt}" loading="lazy">
        `;
        galleryGrid.appendChild(galleryItem);
    });
}

// Setup Form Handling
function setupFormHandling() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    // Format phone number on input
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleFormSubmit(form);
    });
}

// Handle Form Submission
async function handleFormSubmit(form) {
    // Validate selection
    if (!selectedService) {
        showErrorAlert('Please select a service first');
        return;
    }

    // Get form data
    const formData = new FormData(form);
    const date = formData.get('date');
    const time = formData.get('time');
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const location = formData.get('location') || 'Studio';
    const notes = formData.get('notes');

    // Validate required fields
    if (!date || !time || !name || !email || !phone) {
        showErrorAlert('Please fill in all required fields');
        return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
        showErrorAlert('Please enter a valid email address');
        return;
    }

    // Prepare appointment details
    const appointmentDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const templateParams = {
        to_email: email,
        client_name: name,
        service_name: selectedService.name,
        service_price: selectedService.price,
        appointment_date: appointmentDate,
        appointment_time: time,
        location: location === 'studio' ? 'Studio' : 'Home Service',
        phone: phone,
        notes: notes || 'No special requests',
        business_name: appData.site.title,
        business_phone: appData.site.contact.phone,
        business_email: appData.site.contact.email,
        deposit: appData.booking.deposit,
        cancellation_policy: appData.booking.cancellationPolicy
    };

    try {
        // Disable submit button
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Check if EmailJS is properly configured
        if (!appData.site.emailjs.publicKey || appData.site.emailjs.publicKey.includes('YOUR_')) {
            showErrorAlert('Email service not configured. Please contact support.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Your Look';
            return;
        }

        // Send email
        const response = await emailjs.send(
            appData.site.emailjs.serviceId,
            appData.site.emailjs.templateId,
            templateParams
        );

        console.log('✓ Email sent:', response);

        // Show success alert
        showSuccessAlert(`Booking confirmed! Check your email at ${email}`);

        // Reset form
        form.reset();
        document.querySelectorAll('.service-pill').forEach(pill => {
            pill.classList.remove('active');
        });
        selectedService = null;

        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Book Your Look';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error('✗ Error sending email:', error);
        showErrorAlert('Failed to send booking. Please try again.');

        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Book Your Look';
    }
}

// Format Phone Number
function formatPhoneNumber(value) {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
        return digits;
    } else if (digits.length <= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
}

// Set Minimum Date
function setMinDate() {
    const dateInput = document.getElementById('date');
    if (!dateInput) return;

    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
}

// Validate Email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show Success Alert
function showSuccessAlert(message) {
    const alertContainer = document.querySelector('.alert-container') || 
                          document.querySelector('.booking-step:last-of-type');
    
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.innerHTML = `✓ ${message}`;
    
    const existingAlert = alertContainer.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    alertContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Show Error Alert
function showErrorAlert(message) {
    const alertContainer = document.querySelector('.alert-container') || 
                          document.querySelector('.booking-step:last-of-type');
    
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    alert.innerHTML = `✗ ${message}`;
    
    const existingAlert = alertContainer.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    alertContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Smooth Scroll Navigation
document.addEventListener('click', (e) => {
    if (e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});
