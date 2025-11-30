// ============================================
// GLAMORBYBEE - MODERN BOOKING APP
// 2025 - Fresh, Fast, Flawless
// ============================================

console.log('🚀 app.js loaded');
console.log('🌟 GLAMORBYBEE APP STARTING - Version 1.0');

let appData = {};
let selectedService = null;

// Suppress extension/add-on message channel errors
window.addEventListener('unhandledrejection', event => {
    if (event.reason && event.reason.message && event.reason.message.includes('message channel closed')) {
        event.preventDefault();
    }
});

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

// Get Admin Link from Configuration
function getAdminLink() {
    const adminConfig = appData?.components?.admin;
    if (!adminConfig) return 'https://dev-admin.glamorbybee.com/';
    
    // Detect environment based on current hostname
    const hostname = window.location.hostname;
    let domainKey = 'dev_domain'; // default
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        domainKey = 'local_domain';
    } else if (hostname === 'glamorbybee.com') {
        domainKey = 'prod_domain';
    }
    
    let domain = adminConfig[domainKey] || adminConfig.dev_domain || 'https://dev-admin.glamorbybee.com/';
    
    // If domain is "auto" for localhost, use current origin with /admin/index.html
    if (domain === 'auto') {
        domain = window.location.origin + '/admin/index.html';
    }
    
    return domain;
}

// Initialize Admin Links from Configuration
function initializeAdminLinks() {
    const adminLink = getAdminLink();
    document.querySelectorAll('[data-admin-link]').forEach(element => {
        element.href = adminLink;
    });
}

// Get Invoice Link from Configuration
function getInvoiceLink() {
    const invoiceConfig = appData?.components?.invoice;
    if (!invoiceConfig) return 'http://localhost:5500/invoice/index.html';
    
    // Resolve current_domain if it references another key
    const currentDomainKey = invoiceConfig.current_domain;
    const domain = invoiceConfig[currentDomainKey] || currentDomainKey;
    
    return domain || 'http://localhost:5500/invoice/index.html';
}

// Initialize Invoice Links from Configuration
function initializeInvoiceLinks() {
    const invoiceLink = getInvoiceLink();
    const invoiceCreateLink = invoiceLink.replace(/\/?$/, '/create.html');
    
    document.querySelectorAll('[data-invoice-link]').forEach(element => {
        element.href = invoiceLink;
    });
    
    document.querySelectorAll('[data-invoice-create-link]').forEach(element => {
        element.href = invoiceCreateLink;
    });
}

// Get Client Link from Configuration
function getClientLink() {
    const clientConfig = appData?.components?.client;
    if (!clientConfig) return 'https://dev-client.glamorbybee.com/';
    
    // Resolve current_domain if it references another key
    const currentDomainKey = clientConfig.current_domain;
    const domain = clientConfig[currentDomainKey] || currentDomainKey;
    
    return domain || 'https://dev-client.glamorbybee.com/';
}

// Initialize Client Links from Configuration
function initializeClientLinks() {
    const clientLink = getClientLink();
    document.querySelectorAll('[data-client-link]').forEach(element => {
        element.href = clientLink;
    });
}

// Get Schedule Link from Configuration
function getScheduleLink() {
    const scheduleConfig = appData?.components?.schedule;
    if (!scheduleConfig) return 'https://dev-schedule.glamorbybee.com/';
    
    // Resolve current_domain if it references another key
    const currentDomainKey = scheduleConfig.current_domain;
    const domain = scheduleConfig[currentDomainKey] || currentDomainKey;
    
    return domain || 'https://dev-schedule.glamorbybee.com/';
}

// Initialize Schedule Links from Configuration
function initializeScheduleLinks() {
    const scheduleLink = getScheduleLink();
    document.querySelectorAll('[data-schedule-link]').forEach(element => {
        element.href = scheduleLink;
    });
}

// Get Services Link from Configuration
function getServicesLink() {
    const servicesConfig = appData?.components?.services;
    if (!servicesConfig) return 'https://dev-services.glamorbybee.com/';
    
    // Resolve current_domain if it references another key
    const currentDomainKey = servicesConfig.current_domain;
    const domain = servicesConfig[currentDomainKey] || currentDomainKey;
    
    return domain || 'https://dev-services.glamorbybee.com/';
}

// Initialize Services Links from Configuration
function initializeServicesLinks() {
    const servicesLink = getServicesLink();
    document.querySelectorAll('[data-services-link]').forEach(element => {
        element.href = servicesLink;
    });
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
        const appResponse = await fetch('json/app.json');
        const servicesResponse = await fetch('json/services.json');
        
        console.log('App.json response status:', appResponse.status);
        console.log('Services.json response status:', servicesResponse.status);
        
        appData = await appResponse.json();
        const servicesData = await servicesResponse.json();
        
        // Merge services into appData for backward compatibility
        appData.services = servicesData.services;
        
        console.log('✓ App config loaded:', appData);
        console.log('✓ Services loaded:', appData.services.length, 'items');
        console.log('Contact data:', appData.site.contact);
        
        // Initialize all component links from configuration
        initializeAdminLinks();
        initializeInvoiceLinks();
        initializeClientLinks();
        initializeScheduleLinks();
        initializeServicesLinks();
        
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
        
        // Initialize FormService for email handling
        console.log('Initializing FormService...');
        const formService = new FormService({
            formSelector: '#bookingForm',
            emailJSServiceId: appData.site.emailjs.serviceId,
            emailJSTemplateId: appData.site.emailjs.templateId,
            emailJSPublicKey: appData.site.emailjs.publicKey
        });
        await formService.init();
        
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
    console.log('📄 populatePageContent called');
    console.log('📦 appData loaded:', !!appData, 'keys:', Object.keys(appData).length);
    
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
    console.log('📋 Booking Policy - element:', !!bookingPolicy, 'policy text:', appData.booking?.cancellationPolicy?.substring(0, 30));
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
    console.log('🎯 populateServicesGrid called - servicesGrid:', !!servicesGrid, 'services:', appData.services?.length);
    if (!servicesGrid || !appData.services) {
        console.warn('⚠️ servicesGrid or appData.services missing');
        return;
    }

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
    console.log('💊 populateServicePills - select element:', !!serviceSelect, 'services count:', appData.services?.length);
    if (!serviceSelect || !appData.services) {
        console.warn('⚠️ servicePills or appData.services missing');
        return;
    }

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
    // Find the full service object and set selectedService
    selectedService = appData.services.find(s => s.id === serviceId);
    
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
    
    console.log(`✅ Selected service: ${serviceName} - Full object:`, selectedService);
}

// Populate Time Slots
function populateTimeSlots() {
    const timeSelect = document.getElementById('time');
    console.log('⏰ populateTimeSlots - select element:', !!timeSelect, 'timeSlots count:', appData.booking?.timeSlots?.length);
    if (!timeSelect || !appData.booking || !appData.booking.timeSlots) {
        console.warn('⚠️ time select or timeSlots missing');
        return;
    }

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
    console.log('👥 populateTeam called - teamGrid:', !!teamGrid, 'team:', appData.team?.length);
    if (!teamGrid || !appData.team) {
        console.warn('⚠️ teamGrid or appData.team missing');
        return;
    }

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
    console.log('💬 populateTestimonials called - testimonialsGrid:', !!testimonialsGrid, 'testimonials:', appData.testimonials?.length);
    if (!testimonialsGrid || !appData.testimonials) {
        console.warn('⚠️ testimonialsGrid or appData.testimonials missing');
        return;
    }

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
    console.log('📝 setupFormHandling - form element:', !!form);
    if (!form) {
        console.warn('⚠️ bookingForm element not found!');
        return;
    }

    // Format phone number on input
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }

    // Make date field clickable anywhere to open calendar
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.addEventListener('click', () => {
            dateInput.showPicker?.();
        });
        // Sync date to hidden form input
        dateInput.addEventListener('change', (e) => {
            const hiddenDateInput = document.getElementById('hidden_date');
            if (hiddenDateInput) {
                hiddenDateInput.value = e.target.value;
            }
        });
    }

    // Sync time to hidden form input
    const timeSelect = document.getElementById('time');
    if (timeSelect) {
        // Sync on change
        timeSelect.addEventListener('change', (e) => {
            const hiddenTimeInput = document.getElementById('hidden_time');
            if (hiddenTimeInput) {
                hiddenTimeInput.value = e.target.value;
                console.log('⏰ Time synced:', e.target.value);
            }
        });
        
        // Also sync on input for better responsiveness
        timeSelect.addEventListener('input', (e) => {
            const hiddenTimeInput = document.getElementById('hidden_time');
            if (hiddenTimeInput) {
                hiddenTimeInput.value = e.target.value;
            }
        });
    }

    // Handle location toggle - show/hide service address
    const locationRadios = document.querySelectorAll('input[name="location"]');
    const serviceAddressContainer = document.getElementById('serviceAddressContainer');
    const serviceAddressInput = document.getElementById('serviceAddress');
    const studioNotice = document.getElementById('studioNotice');
    
    console.log('🔧 Location toggle setup:', {
        radiosFound: locationRadios.length,
        containerFound: !!serviceAddressContainer,
        inputFound: !!serviceAddressInput,
        studioNoticeFound: !!studioNotice
    });

    // Initialize display based on default checked radio
    const checkedRadio = document.querySelector('input[name="location"]:checked');
    if (checkedRadio && checkedRadio.value === 'home') {
        serviceAddressContainer.style.display = 'block';
        studioNotice.style.display = 'none';
    } else if (checkedRadio && checkedRadio.value === 'studio') {
        serviceAddressContainer.style.display = 'none';
        studioNotice.style.display = 'block';
    } else {
        serviceAddressContainer.style.display = 'none';
        studioNotice.style.display = 'none';
    }
    
    // Initialize Google Places Autocomplete
    let autocomplete = null;
    
    locationRadios.forEach(radio => {
        radio.addEventListener('change', async (e) => {
            console.log('📍 Location changed to:', e.target.value);
            
            if (e.target.value === 'home') {
                serviceAddressContainer.style.display = 'block';
                studioNotice.style.display = 'none';
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
                studioNotice.style.display = 'block';
                serviceAddressContainer.style.display = 'none';
                serviceAddressInput.required = false;
                serviceAddressInput.value = '';
                console.log('✅ Studio service selected - notice shown');
            }
        });
    });

    // Note: Form submission is now handled by FormService (form-service.js)
}

// Retry Email Send (helper for when EmailJS loads dynamically)
async function retryEmailSend(appData, templateParams, submitBtn, email) {
    try {
        const response = await emailjs.send(
            appData.site.emailjs.serviceId,
            appData.site.emailjs.templateId,
            templateParams
        );

        console.log('✅ Email sent successfully:', response);
        showSuccessAlert(`Booking confirmed! Check your email at ${email}`);

        // Reset form
        const form = document.getElementById('bookingForm');
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
        submitBtn.disabled = false;
        submitBtn.textContent = 'Book Your Look';
    }
}

// Handle Form Submission
async function handleFormSubmit(form) {
    console.log('✉️ Form submitted - selectedService:', !!selectedService, selectedService?.name);
    // Validate selection
    if (!selectedService) {
        console.warn('⚠️ No service selected!');
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
    const missingFields = [];
    if (!date) missingFields.push('Date');
    if (!time) missingFields.push('Time');
    if (!name) missingFields.push('Name');
    if (!email) missingFields.push('Email');
    if (!phone) missingFields.push('Phone');

    if (missingFields.length > 0) {
        showErrorAlert(`Please fill in: ${missingFields.join(', ')}`);
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
    console.log('📧 Preparing email - service:', selectedService.name, 'price:', selectedService.price, 'date:', appointmentDate, 'time:', time);

    // Get current time with timezone for booking submission
    const now = new Date();
    const bookingTime = now.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });

    const templateParams = {
        to_email: email,
        from_name: name,
        client_name: name,
        service_name: selectedService.name,
        service_price: selectedService.price,
        appointment_date: appointmentDate,
        appointment_time: time,
        time: bookingTime,
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
        console.log('🚀 Sending email via EmailJS...');
        
        // Ensure EmailJS is initialized
        if (typeof emailjs === 'undefined') {
            console.error('❌ EmailJS not available - attempting to load dynamically...');
            
            // Try to load EmailJS dynamically
            try {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3.11.0/dist/index.min.js';
                script.onload = async () => {
                    console.log('✓ EmailJS loaded dynamically');
                    if (typeof emailjs !== 'undefined') {
                        emailjs.init(appData.site.emailjs.publicKey);
                        window.emailjsInitialized = true;
                        // Retry sending email
                        await retryEmailSend(appData, templateParams, submitBtn, email);
                    }
                };
                script.onerror = () => {
                    console.error('❌ Failed to load EmailJS dynamically');
                    showErrorAlert('Email service not available. Please try again later.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Book Your Look';
                };
                document.head.appendChild(script);
                return;
            } catch (err) {
                console.error('❌ Error loading EmailJS:', err);
                showErrorAlert('Email service not available. Please try again later.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Book Your Look';
                return;
            }
        }
        
        // Initialize if not already done
        if (!window.emailjsInitialized) {
            try {
                emailjs.init(appData.site.emailjs.publicKey);
                window.emailjsInitialized = true;
                console.log('✓ EmailJS initialized now');
            } catch (err) {
                console.error('❌ EmailJS init failed:', err);
                showErrorAlert('Email service initialization failed.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Book Your Look';
                return;
            }
        }
        
        const response = await emailjs.send(
            appData.site.emailjs.serviceId,
            appData.site.emailjs.templateId,
            templateParams
        );

        console.log('✅ Email sent successfully:', response);

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
    
    // Sync to hidden field on initialization
    const hiddenDateInput = document.getElementById('hidden_date');
    if (hiddenDateInput) {
        hiddenDateInput.value = today;
    }
}

// Validate Email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show Success Alert - Custom Modal (no Bootstrap dependency)
function showSuccessAlert(message) {
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
        <p style="color: #666; margin-bottom: 1.5rem;">${message}</p>
        <button onclick="document.getElementById('bookingOverlay').remove()" style="
            background: #d63384;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 1rem;
        ">OK</button>
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
}

// Show Error Alert
function showErrorAlert(message) {
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
        <p style="color: #666; margin-bottom: 1.5rem; line-height: 1.5;">${message}</p>
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
    if (!document.getElementById('errorAnimation')) {
        const style = document.createElement('style');
        style.id = 'errorAnimation';
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
}

// Handle Instagram Embed - Opens in same window with back button support
function setupInstagramEmbedHandler() {
    console.log('🔍 setupInstagramEmbedHandler called');
    
    // Instagram embed script will handle everything
    if (window.instgrm) {
        console.log('📲 Instagram embed script found, processing embeds');
        window.instgrm.Embeds.process();
    }
    
    // Intercept Instagram links and open in same window (allow back button)
    const instagramContainer = document.getElementById('instagramContainer');
    if (instagramContainer) {
        // Set up observer to monitor for new links added by Instagram
        const observer = new MutationObserver(() => {
            const links = instagramContainer.querySelectorAll('a');
            links.forEach(link => {
                // Remove target="_blank" to open in same window
                link.removeAttribute('target');
                // Links will now open in same window, allowing browser back button to work
                link.addEventListener('click', (e) => {
                    console.log('🔗 Instagram post clicked:', link.href);
                }, { once: true });
            });
        });
        
        observer.observe(instagramContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['target']
        });
        
        console.log('✅ Instagram embed: Links open in same window - use browser back button to return');
    }
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

/* ============================================
   TABLE HEADER FILTERS
   ============================================ */

function initTableHeaderFilters() {
    const filterInputs = document.querySelectorAll('.filter-row input, .filter-row select');
    
    filterInputs.forEach(input => {
        input.addEventListener('change', handleTableFilter);
        input.addEventListener('keyup', debounce(handleTableFilter, 300));
    });
}

function handleTableFilter(e) {
    const filterRow = e.target.closest('.filter-row');
    if (!filterRow) return;
    
    const table = filterRow.closest('table');
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr:not(.filter-row)');
    const filters = {};
    
    filterRow.querySelectorAll('input, select').forEach((input, idx) => {
        const filterKey = input.getAttribute('data-filter');
        if (filterKey && input.value) {
            filters[filterKey] = input.value.toLowerCase();
        }
    });
    
    rows.forEach(row => {
        let showRow = true;
        const cells = row.querySelectorAll('td');
        
        Object.entries(filters).forEach(([key, value]) => {
            const cellIndex = Array.from(filterRow.querySelectorAll('input, select')).findIndex(
                el => el.getAttribute('data-filter') === key
            );
            
            if (cellIndex >= 0 && cellIndex < cells.length) {
                const cellText = cells[cellIndex].textContent.toLowerCase();
                const inputType = filterRow.querySelectorAll('input, select')[cellIndex].type;
                
                if (inputType === 'number') {
                    const cellNum = parseFloat(cellText);
                    const filterNum = parseFloat(value);
                    if (isNaN(cellNum) || cellNum < filterNum) {
                        showRow = false;
                    }
                } else if (inputType === 'date') {
                    // Simple date filter - shows rows on or after the selected date
                    if (cellText && !cellText.includes(value)) {
                        showRow = false;
                    }
                } else {
                    if (!cellText.includes(value)) {
                        showRow = false;
                    }
                }
            }
        });
        
        row.style.display = showRow ? '' : 'none';
    });
}

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Initialize table filters when page loads
document.addEventListener('DOMContentLoaded', initTableHeaderFilters);

