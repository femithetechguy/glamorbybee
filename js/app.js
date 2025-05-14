document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add scroll padding for fixed header
    document.documentElement.style.setProperty(
        '--scroll-padding',
        document.querySelector('.top-bar').offsetHeight + 'px'
    );

    // Update copyright year
    document.getElementById('copyright-year').textContent = new Date().getFullYear();

    // Menu toggle functionality
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Close menu when clicking a nav link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Back to top functionality
    const backToTopButton = document.getElementById('back-to-top');
    
    // Show button when scrolling down 200px
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Smooth scroll to top when clicked
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Dynamic appointment form
    const contactField = document.getElementById('contact-field');
    const contactMethods = document.getElementsByName('contact_method');

    function updateContactField(method) {
        let fieldHTML = '';
        switch(method) {
            case 'sms':
            case 'phone':
                fieldHTML = `
                    <label for="phone_number">Phone Number * <span class="sr-only">(required)</span></label>
                    <input type="tel" id="phone_number" name="phone_number" 
                           pattern="[0-9]{10}" required
                           placeholder="770-648-4939"
                           aria-required="true" aria-label="Phone Number">
                `;
                break;
            case 'email':
                fieldHTML = `
                    <label for="email">Email Address * <span class="sr-only">(required)</span></label>
                    <input type="email" id="email" name="email" required
                           placeholder="your@email.com"
                           aria-required="true" aria-label="Email Address">
                `;
                break;
        }
        contactField.innerHTML = fieldHTML;
    }

    contactMethods.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateContactField(e.target.value);
        });
    });

    // Service mode functionality
    const serviceModes = document.getElementsByName('service_mode');
    const serviceLocationField = document.getElementById('service-location-field');

    function updateServiceLocation(mode) {
        serviceLocationField.style.display = 'block';
        let fieldHTML = '';
        if (mode === 'home') {
            fieldHTML = `
                <label for="address">Service Location (additional charge applies) * <span class="sr-only">(required)</span></label>
                <input type="text" id="address" name="address" required
                       placeholder="Please provide your service address"
                       aria-required="true" aria-label="Service Location">
                <div id="home-service-warning" style="margin-top:8px;color:#a8071a;background:#fff1f0;border-left:4px solid #ff4d4f;padding:8px 12px;border-radius:6px;font-weight:500;font-size:1rem;">
                    <ion-icon name="${siteNotices.homeService.icon}" style="color:#ff4d4f; font-size:1.2em; vertical-align:middle; margin-right:6px;"></ion-icon>
                    ${siteNotices.homeService.title} ${siteNotices.homeService.message}
                </div>
            `;
        } else if (mode === 'studio') {
            const selectedContact = document.querySelector('input[name="contact_method"]:checked');
            fieldHTML = `
                <div class="studio-info" aria-live="polite">
                    <ion-icon name="location" aria-hidden="true"></ion-icon>
                    <div class="info-content">
                        <p class="info-text">
                            Our studio location will be sent to your 
                            <span class="contact-method-highlight">
                                ${selectedContact ? selectedContact.value : 'preferred contact'} 
                            </span>
                        </p>
                        <p class="info-subtext">You'll receive the details shortly after booking</p>
                    </div>
                </div>
            `;
        }
        serviceLocationField.innerHTML = fieldHTML;
    }

    // Set initial service mode message
    const initialServiceMode = document.querySelector('input[name="service_mode"]:checked');
    if (initialServiceMode) {
        updateServiceLocation(initialServiceMode.value);
    }

    // Update when service mode changes
    serviceModes.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateServiceLocation(e.target.value);
        });
    });

    // Update studio message when contact method changes
    contactMethods.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const serviceMode = document.querySelector('input[name="service_mode"]:checked');
            if (serviceMode && serviceMode.value === 'studio') {
                updateServiceLocation('studio');
            }
        });
    });

    // Populate service dates (next 30 days, excluding Sundays)
    const serviceDateSelect = document.getElementById('service-date');
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        if (date.getDay() !== 0) {
            const option = document.createElement('option');
            option.value = date.toISOString().split('T')[0];
            option.textContent = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            serviceDateSelect.appendChild(option);
        }
    }

    // Populate time slots (6 AM to 9 PM)
    const serviceTimeSelect = document.getElementById('service-time');
    const startHour = 6; // 6 AM
    const endHour = 21;  // 9 PM

    for (let hour = startHour; hour <= endHour; hour++) {
        const option = document.createElement('option');
        option.value = `${hour.toString().padStart(2, '0')}:00`;
        const timeString = hour < 12 
            ? `${hour}:00 AM`
            : `${hour === 12 ? 12 : hour - 12}:00 PM`;
        option.textContent = timeString;
        serviceTimeSelect.appendChild(option);
    }

    // Render services dynamically
    if (typeof makeupServices !== "undefined") {
        const servicesGrid = document.getElementById('services-grid');
        if (servicesGrid) {
            servicesGrid.innerHTML = makeupServices.map(service => `
                <div class="service-card">
                    <img src="${service.image}" alt="${service.name}" />
                    <h3>${service.name}</h3>
                    <p>Starting at $${service.price}</p>
                    <ul>
                        ${service.features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        }
    }

    // Populate service types dynamically from makeupServices
    const serviceTypeSelect = document.getElementById('service-type');
    if (serviceTypeSelect && typeof makeupServices !== "undefined") {
        serviceTypeSelect.innerHTML = makeupServices.map(service => `
            <option value="${service.name}">${service.name}</option>
        `).join('');
    }

    // Render FYI Notice
    const fyiContainer = document.getElementById('fyi-notice-container');
    if (fyiContainer && siteNotices?.fyi) {
        fyiContainer.innerHTML = `
        <div class="container my-4">
          <div class="alert alert-warning fyi-deposit animate__animated animate__pulse animate__repeat-3" role="alert" style="font-size:1.2rem; font-weight:600; border-left:6px solid #ffb300; background: #fffbe6; display: flex; align-items: center; justify-content: center;">
            <ion-icon name="${siteNotices.fyi.icon}" class="fyi-icon" style="font-size:2.2rem; color:#ffb300; margin-right:16px; animation: fyiIconBounce 1.2s infinite alternate;"></ion-icon>
            <span>
              <span style="color:#d48806; font-size:1.25rem; font-weight:700; letter-spacing:0.02em;">${siteNotices.fyi.title}</span>
              <span style="margin-left:10px; color:#333;">
                ${siteNotices.fyi.message}
              </span>
            </span>
          </div>
        </div>
        `;
    }

    // Render Booking Notice
    const bookingContainer = document.getElementById('booking-notice-container');
    if (bookingContainer && siteNotices?.booking) {
        bookingContainer.innerHTML = `
        <div class="alert alert-info booking-notice" role="alert" style="margin: 2rem auto 1rem auto; max-width: 700px; font-size:1.1rem; background: #e6f7ff; border-left: 6px solid #1890ff; color: #0050b3; display: flex; align-items: flex-start;">
          <ion-icon name="${siteNotices.booking.icon}" style="font-size:2rem; color:#1890ff; margin-right:14px; margin-top:2px;"></ion-icon>
          <div>
            <strong>${siteNotices.booking.title}</strong>
            <span style="margin-left:6px;">
              ${siteNotices.booking.message}
            </span>
          </div>
        </div>
        `;
    }

    // Render Cancellation Notice
    const cancellationContainer = document.getElementById('cancellation-notice-container');
    if (cancellationContainer && siteNotices?.cancellation) {
        cancellationContainer.innerHTML = `
        <div class="alert alert-danger cancellation-notice" role="alert" style="margin: 1.5rem auto 0 auto; max-width: 700px; font-size:1.1rem; background: #fff1f0; border-left: 6px solid #ff4d4f; color: #a8071a; display: flex; align-items: flex-start;">
          <ion-icon name="${siteNotices.cancellation.icon}" style="font-size:2rem; color:#ff4d4f; margin-right:14px; margin-top:2px;"></ion-icon>
          <div>
            <strong>${siteNotices.cancellation.title}</strong>
            <span style="margin-left:6px;">
              ${siteNotices.cancellation.message}
            </span>
          </div>
        </div>
        `;
    }
});