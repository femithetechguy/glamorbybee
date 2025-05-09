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
                    <label for="phone_number">Phone Number *</label>
                    <input type="tel" id="phone_number" name="phone_number" 
                           pattern="[0-9]{10}" required
                           placeholder="770-648-4939">
                `;
                break;
            case 'email':
                fieldHTML = `
                    <label for="email">Email Address *</label>
                    <input type="email" id="email" name="email" required
                           placeholder="your@email.com">
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
        let fieldHTML = '';
        if (mode === 'home') {
            fieldHTML = `
                <label for="address">Service Location (additional charge applies) *</label>
                <input type="text" id="address" name="address" required
                       placeholder="Please provide your service address">
            `;
        } else if (mode === 'salon') {
            const selectedContact = document.querySelector('input[name="contact_method"]:checked');
            fieldHTML = `
                <div class="salon-info">
                    <i class="fas fa-info-circle"></i>
                    <p class="info-text">
                        Our salon location will be sent to your 
                        <span class="highlight">${selectedContact ? selectedContact.value : 'preferred'}</span> 
                        contact method.
                    </p>
                </div>
            `;
        }
        serviceLocationField.innerHTML = fieldHTML;
    }

    // Add event listeners for service mode changes
    serviceModes.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateServiceLocation(e.target.value);
        });
    });

    // Update salon message when contact method changes
    contactMethods.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const serviceMode = document.querySelector('input[name="service_mode"]:checked');
            if (serviceMode && serviceMode.value === 'salon') {
                updateServiceLocation('salon');
            }
        });
    });

    // Populate service dates (next 30 days, excluding Sundays)
    const serviceDateSelect = document.getElementById('service-date');
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Skip Sundays (0 is Sunday in getDay())
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
        
        // Format time string (AM/PM)
        const timeString = hour < 12 
            ? `${hour}:00 AM`
            : `${hour === 12 ? 12 : hour - 12}:00 PM`;
        
        option.textContent = timeString;
        serviceTimeSelect.appendChild(option);
    }

    function initializeAutocomplete() {
        const addressInput = document.getElementById('address');
        if (!addressInput) return;

        const autocomplete = new google.maps.places.Autocomplete(addressInput, {
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address'],
            types: ['address']
        });

        // Update the input when a place is selected
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
                addressInput.value = place.formatted_address;
            }
        });

        // Prevent form submission on enter (for better UX)
        addressInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && document.activeElement === addressInput) {
                e.preventDefault();
            }
        });
    }

    // Initialize autocomplete when service mode changes to 'home'
    serviceModes.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'home') {
                setTimeout(initializeAutocomplete, 100); // Wait for DOM update
            }
        });
    });
});