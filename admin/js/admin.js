/* ============================================
   GLAMORBYBEE ADMIN DASHBOARD JAVASCRIPT
   2025 - Backend Management
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard initialized');
    
    // Initialize components
    initNavigation();
    initQuickActions();
    loadRecentAppointments();
});

/* ============================================
   NAVIGATION
   ============================================ */

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Handle internal navigation (anchors)
            if (href.startsWith('#')) {
                e.preventDefault();
                
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Here you would load the appropriate section content
                console.log('Navigating to:', href);
                
                // Handle special cases
                if (href === '#logout') {
                    handleLogout();
                }
            }
            // External links (invoice page) will navigate normally
        });
    });
}

/* ============================================
   QUICK ACTIONS
   ============================================ */

function initQuickActions() {
    const actionCards = document.querySelectorAll('.action-card');
    
    actionCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                console.log('Quick action:', href);
                
                // Handle different quick actions
                switch(href) {
                    case '#schedule':
                        loadScheduleView();
                        break;
                    case '#new-appointment':
                        openNewAppointmentModal();
                        break;
                    case '#clients':
                        loadClientsView();
                        break;
                }
            }
            // External links (invoice) will navigate normally
        });
    });
}

/* ============================================
   APPOINTMENTS
   ============================================ */

function loadRecentAppointments() {
    // In production, this would fetch from Firebase
    // For now, the appointments are hardcoded in HTML
    console.log('Recent appointments loaded');
    
    // Add event listeners to action buttons
    const actionButtons = document.querySelectorAll('.icon-btn-sm');
    
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('title');
            const row = this.closest('tr');
            const clientName = row.querySelector('.client-name').textContent;
            
            console.log(`${action} for ${clientName}`);
            
            // Handle different actions
            if (action === 'View Details') {
                viewAppointmentDetails(row);
            } else if (action === 'Edit') {
                editAppointment(row);
            } else if (action === 'Cancel') {
                cancelAppointment(row);
            }
        });
    });
}

function viewAppointmentDetails(row) {
    console.log('Viewing appointment details');
    // Would open a modal with full appointment details
}

function editAppointment(row) {
    console.log('Editing appointment');
    // Would open edit modal
}

function cancelAppointment(row) {
    const clientName = row.querySelector('.client-name').textContent;
    if (confirm(`Cancel appointment for ${clientName}?`)) {
        console.log('Appointment cancelled');
        // Would update Firebase and refresh table
    }
}

/* ============================================
   SCHEDULE VIEW
   ============================================ */

function loadScheduleView() {
    console.log('Loading schedule view');
    // Would load calendar/schedule interface
    // This could be a separate page or dynamically loaded content
}

/* ============================================
   NEW APPOINTMENT
   ============================================ */

function openNewAppointmentModal() {
    console.log('Opening new appointment modal');
    // Would show modal with booking form similar to main site
}

/* ============================================
   CLIENTS VIEW
   ============================================ */

function loadClientsView() {
    console.log('Loading clients view');
    // Would load client management interface
}

/* ============================================
   LOGOUT
   ============================================ */

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('Logging out...');
        // Would handle Firebase auth logout
        // Then redirect to login or main site
        window.location.href = '../index.html';
    }
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function formatTime(timeString) {
    return timeString;
}

function updateStats() {
    // Would fetch real-time stats from Firebase
    console.log('Updating stats...');
}

// Update stats every 30 seconds
setInterval(updateStats, 30000);
