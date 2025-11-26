// ============================================
// GLAMORBYBEE - MODERN BOOKING APP
// 2025 - Fresh, Fast, Flawless
// ============================================

console.log('✓ app.js loaded');

let appData = {};
let selectedService = null;

// Back to Top Button
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Mobile Menu Toggle
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('mobile-open');
        });
        
        // Close menu when a link is clicked
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('mobile-open');
            });
        });
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    console.log('✓ DOMContentLoaded fired');
    setupMobileMenu();
    setupBackToTop();
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
        populateTeam();
        populateTestimonials();
        
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
        const heroBrandName = document.getElementById('heroBrandName');
        const heroTagline = document.getElementById('heroTagline');
        const heroSubtitle = document.getElementById('heroSubtitle');
        
        if (heroBrandName) {
            heroBrandName.textContent = appData.site.title || 'GlamorByBee';
        }
        if (heroTagline) {
            heroTagline.textContent = appData.site.tagline || 'Professional makeup artistry';
        }
        if (heroSubtitle) {
            heroSubtitle.textContent = appData.site.description || 'Get your glow in 60 seconds';
        }
    }

    // About section (if exists)
    const aboutSection = document.querySelector('[data-section="about"]');
    if (aboutSection) {
        aboutSection.innerHTML = `<h2>${appData.about.title}</h2><p>${appData.about.description}</p>`;
    }

    // Contact section - Icon links only
    if (appData.site.contact) {
        const contactEmailIcon = document.getElementById('contactEmailIcon');
        const contactPhoneIcon = document.getElementById('contactPhoneIcon');
        const contactInstagramIcon = document.getElementById('contactInstagramIcon');
        const contactLocationIcon = document.getElementById('contactLocationIcon');
        
        if (contactEmailIcon) {
            contactEmailIcon.href = `mailto:${appData.site.contact.email}`;
            contactEmailIcon.title = appData.site.contact.email;
        }
        if (contactPhoneIcon) {
            contactPhoneIcon.href = `tel:${appData.site.contact.phone.replace(/\D/g, '')}`;
            contactPhoneIcon.title = appData.site.contact.phone;
        }
        if (contactInstagramIcon) {
            contactInstagramIcon.href = appData.site.contact.instagram;
            contactInstagramIcon.title = '@glamor_bybee';
        }
        if (contactLocationIcon) {
            contactLocationIcon.href = `https://maps.google.com/?q=${encodeURIComponent(appData.site.contact.location)}`;
            contactLocationIcon.title = appData.site.contact.location;
            contactLocationIcon.target = '_blank';
            contactLocationIcon.rel = 'noopener noreferrer';
        }
    }

    // Footer contact info
    const footerLocation = document.getElementById('footerLocation');
    const footerEmail = document.getElementById('footerEmail');
    const footerPhone = document.getElementById('footerPhone');
    if (footerLocation) footerLocation.innerHTML = `<strong>Location:</strong> <a href="https://maps.google.com/?q=${encodeURIComponent(appData.site.contact.location)}" target="_blank" rel="noopener noreferrer">${appData.site.contact.location}</a>`;
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

    // App Development credit line
    if (appData.appdev) {
        const appdevCredit = document.getElementById('appdevCredit');
        if (appdevCredit) {
            appdevCredit.innerHTML = appData.appdev.creditLine;
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
            <div class="service-image-wrapper">
                <img src="${service.image}" alt="${service.name}" class="service-image" loading="lazy">
            </div>
            <div class="service-body">
                <h4 class="service-name">${service.name}</h4>
                <p class="service-desc">${service.description}</p>
                <a href="#booking" class="service-book-btn" data-service-id="${service.id}" data-service-name="${service.name}">
                    <i class="bi bi-calendar-check"></i> Book
                </a>
            </div>
        `;
        servicesGrid.appendChild(card);
    });
    
    // Add click handlers to book buttons
    document.querySelectorAll('.service-book-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceId = btn.dataset.serviceId;
            const serviceName = btn.dataset.serviceName;
            selectService(serviceId, serviceName);
            
            // Scroll to booking section with smooth animation
            const bookingSection = document.getElementById('booking');
            if (bookingSection) {
                setTimeout(() => {
                    bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });
}

// Populate Gallery
function populateGallery() {
    const galleryTitle = document.getElementById('galleryTitle');
    const galleryDescription = document.getElementById('galleryDescription');
    
    if (appData.gallery) {
        if (galleryTitle) galleryTitle.textContent = appData.gallery.title || 'Gallery';
        if (galleryDescription) galleryDescription.textContent = appData.gallery.description || '';
    }
}

// Populate Service Pills (for booking step 1)
function populateServicePills() {
    const serviceSelect = document.getElementById('servicePills');
    if (!serviceSelect || !appData.services) return;

    serviceSelect.innerHTML = '<option value="">Select a service...</option>';
    
    appData.services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = service.name;
        serviceSelect.appendChild(option);
    });
    
    // Add change event listener
    serviceSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            const service = appData.services.find(s => s.id === e.target.value);
            if (service) {
                selectService(service.id, service.name);
            }
        }
    });
}

// Select a service from the dropdown/booking interface
function selectService(serviceId, serviceName) {
    // Update service input
    const serviceInput = document.getElementById('service_name');
    if (serviceInput) {
        serviceInput.value = serviceName;
    }
    
    // Update select dropdown value
    const serviceSelect = document.getElementById('servicePills');
    if (serviceSelect) {
        serviceSelect.value = serviceId;
    }
    
    console.log(`✅ Selected service: ${serviceName}`);
}

// Populate Time Slots
function populateTimeSlots() {
    const timeSelect = document.getElementById('time');
    if (!timeSelect || !appData.booking || !appData.booking.timeSlots) return;

    timeSelect.innerHTML = '<option value="">Select a time...</option>';
    
    // Get current hour
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    appData.booking.timeSlots.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    });
    
    // Find and select the closest time slot
    let closestTime = null;
    let closestDiff = Infinity;
    
    appData.booking.timeSlots.forEach(time => {
        const [timeStr, period] = time.split(' ');
        let [hours] = timeStr.split(':').map(Number);
        
        // Convert to 24-hour format
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        // Calculate difference in minutes
        const timeDiff = (hours * 60) - (currentHour * 60 + currentMinutes);
        
        // Find closest time that's at least current time or later
        if (timeDiff >= 0 && timeDiff < closestDiff) {
            closestDiff = timeDiff;
            closestTime = time;
        }
    });
    
    // Set default time if found
    if (closestTime) {
        timeSelect.value = closestTime;
    }
}

// Populate Gallery
function populateGallery() {
    const galleryTitle = document.getElementById('galleryTitle');
    const galleryDescription = document.getElementById('galleryDescription');
    
    if (appData.gallery) {
        if (galleryTitle) galleryTitle.textContent = appData.gallery.title || 'Gallery';
        if (galleryDescription) galleryDescription.textContent = appData.gallery.description || '';
    }
}

// Populate Team
function populateTeam() {
    const teamGrid = document.getElementById('teamGrid');
    if (!teamGrid || !appData.team) return;

    teamGrid.innerHTML = '';
    
    appData.team.forEach(member => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.innerHTML = `
            <div class="team-image-wrapper">
                <img src="${member.image}" alt="${member.name}" class="team-image" loading="lazy">
            </div>
            <div class="team-info">
                <h3 class="team-name">${member.name}</h3>
                <p class="team-role">${member.role}</p>
            </div>
        `;
        teamGrid.appendChild(teamCard);
    });
}

// Populate Testimonials
function populateTestimonials() {
    const testimonialsGrid = document.getElementById('testimonialsGrid');
    if (!testimonialsGrid || !appData.testimonials) return;

    testimonialsGrid.innerHTML = '';
    
    appData.testimonials.forEach(testimonial => {
        const testimonialCard = document.createElement('div');
        testimonialCard.className = 'testimonial-card';
        
        const stars = '<i class="bi bi-star-fill"></i>'.repeat(testimonial.rating);
        
        testimonialCard.innerHTML = `
            <div class="testimonial-stars">${stars}</div>
            <p class="testimonial-text">"${testimonial.text}"</p>
            <div class="testimonial-author">
                <div class="testimonial-avatar">
                    <i class="bi bi-person-circle"></i>
                </div>
                <p class="testimonial-name">${testimonial.name}</p>
            </div>
        `;
        testimonialsGrid.appendChild(testimonialCard);
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

    // Handle location toggle - show/hide service address
    const locationRadios = document.querySelectorAll('input[name="location"]');
    const serviceAddressContainer = document.getElementById('serviceAddressContainer');
    const serviceAddressInput = document.getElementById('serviceAddress');
    
    console.log('🔧 Location toggle setup:', {
        radiosFound: locationRadios.length,
        containerFound: !!serviceAddressContainer,
        inputFound: !!serviceAddressInput
    });
    
    // Initialize Google Places Autocomplete
    let autocomplete = null;
    
    locationRadios.forEach(radio => {
        radio.addEventListener('change', async (e) => {
            console.log('📍 Location changed to:', e.target.value);
            
            if (e.target.value === 'home') {
                serviceAddressContainer.style.display = 'block';
                serviceAddressInput.required = true;
                console.log('✅ Address container shown');
                
                // Initialize autocomplete if not already initialized
                if (!autocomplete) {
                    console.log('🔄 Checking Google Maps availability...');
                    console.log('Google object:', typeof google);
                    
                    if (typeof google !== 'undefined') {
                        try {
                            console.log('📦 Loading Places library...');
                            const { Autocomplete } = await google.maps.importLibrary("places");
                            console.log('✅ Places library loaded successfully');
                            
                            autocomplete = new Autocomplete(serviceAddressInput, {
                                componentRestrictions: { country: 'us' },
                                fields: ['formatted_address', 'address_components', 'name'],
                                types: ['address']
                            });
                            console.log('✅ Autocomplete initialized');
                            
                            // Handle place selection
                            autocomplete.addListener('place_changed', () => {
                                const place = autocomplete.getPlace();
                                console.log('📌 Place selected:', place);
                                
                                if (place && place.formatted_address) {
                                    serviceAddressInput.value = place.formatted_address;
                                    console.log('✅ Address set:', place.formatted_address);
                                } else if (place && place.name) {
                                    // Fallback to name if formatted_address isn't available
                                    serviceAddressInput.value = place.name;
                                    console.log('✅ Address set from name:', place.name);
                                } else {
                                    console.log('⚠️ No address found in place object');
                                }
                            });
                            
                            // Workaround: Handle manual keyboard selection
                            serviceAddressInput.addEventListener('keydown', (e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    // Allow Google to handle the selection
                                    setTimeout(() => {
                                        const place = autocomplete.getPlace();
                                        if (place && place.formatted_address) {
                                            serviceAddressInput.value = place.formatted_address;
                                            console.log('✅ Address set via Enter key:', place.formatted_address);
                                        }
                                    }, 100);
                                }
                            });
                            
                            console.log('✅ Autocomplete fully configured');
                        } catch (error) {
                            console.error('❌ Error loading Places library:', error);
                            console.log('ℹ️ Address field will work as regular text input');
                        }
                    } else {
                        console.warn('⚠️ Google Maps not available - using regular text input');
                    }
                } else {
                    console.log('ℹ️ Autocomplete already initialized');
                }
            } else {
                serviceAddressContainer.style.display = 'none';
                serviceAddressInput.required = false;
                serviceAddressInput.value = '';
                console.log('✅ Address container hidden');
            }
        });
    });

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
    const location = formData.get('location') || 'studio';
    const serviceAddress = formData.get('serviceAddress');
    const notes = formData.get('notes');

    // Validate required fields
    if (!date || !time || !name || !email || !phone) {
        showErrorAlert('Please fill in all required fields');
        return;
    }

    // Validate service address if home service is selected
    if (location === 'home' && (!serviceAddress || serviceAddress.trim() === '')) {
        showErrorAlert('Please provide your service address for home service');
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
        location: location === 'studio' ? 'Studio Visit' : 'Home Service',
        service_address: location === 'home' ? serviceAddress : 'N/A (Studio Visit)',
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
    dateInput.value = today;
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

// Handle Instagram Embed - Note: Instagram iframe is cross-origin, so clicks open in new tabs
function setupInstagramEmbedHandler() {
    console.log('🔍 setupInstagramEmbedHandler called');
    
    // Instagram embed script will handle everything
    if (window.instgrm) {
        console.log('📲 Instagram embed script found, processing embeds');
        window.instgrm.Embeds.process();
    }
    
    console.log('ℹ️ Instagram embed ready. Clicks on posts will open Instagram in new tabs.');
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

// Initialize Instagram embed handlers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupInstagramEmbedHandler, 1000);
});

