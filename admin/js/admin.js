/* ============================================
   GLAMORBYBEE ADMIN DASHBOARD JAVASCRIPT
   2025 - Backend Management
   Data Source: excel/master.xlsx (converted to JSON)
   ============================================ */

// Global data store
let adminData = {
    customers: [],
    appointments: [],
    invoices: [],
    products: [],
    staff: [],
    analytics: [],
    inventory: [],
    settings: []
};

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Admin Dashboard initialized');
    
    // Load data from JSON files (generated from Excel)
    await loadAdminData();
    
    // Initialize components
    initNavigation();
    initQuickActions();
    loadAllAppointments();
    updateDashboardStats();
    initAppointmentFilters();
});

/* ============================================
   DATA LOADING
   ============================================ */

async function loadAdminData() {
    try {
        console.log('📊 Loading data from JSON files (source: excel/master.xlsx)...');
        
        // Load all data files in parallel
        const [masterData] = await Promise.all([
            fetch('../json/master_data.json').then(r => r.json())
        ]);
        
        // Store in global data object
        adminData.customers = masterData.customers || [];
        adminData.appointments = masterData.appointments || [];
        adminData.invoices = masterData.invoices || [];
        adminData.products = masterData.products || [];
        adminData.staff = masterData.staff || [];
        adminData.analytics = masterData.analytics || [];
        adminData.inventory = masterData.inventory || [];
        adminData.settings = masterData.settings || [];
        
        console.log('✅ Data loaded:', {
            customers: adminData.customers.length,
            appointments: adminData.appointments.length,
            invoices: adminData.invoices.length,
            products: adminData.products.length,
            staff: adminData.staff.length,
            analytics: adminData.analytics.length,
            inventory: adminData.inventory.length,
            settings: adminData.settings.length
        });
    } catch (error) {
        console.error('❌ Error loading data:', error);
        alert('Failed to load data. Please ensure server is running and JSON files are available.');
    }
}

/* ============================================
   DASHBOARD STATS
   ============================================ */

function updateDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // Today's appointments
    const todayAppointments = adminData.appointments.filter(apt => 
        apt.appointment_date === today && apt.status !== 'cancelled'
    );
    document.querySelector('.stat-card:nth-child(1) h3').textContent = todayAppointments.length;
    
    // Today's revenue
    const todayRevenue = todayAppointments.reduce((sum, apt) => sum + (apt.total_amount || 0), 0);
    document.querySelector('.stat-card:nth-child(2) h3').textContent = `$${todayRevenue.toLocaleString()}`;
    
    // Total clients
    document.querySelector('.stat-card:nth-child(3) h3').textContent = adminData.customers.length;
    
    // Pending confirmations
    const pendingCount = adminData.appointments.filter(apt => apt.status === 'pending').length;
    document.querySelector('.stat-card:nth-child(4) h3').textContent = pendingCount;
    
    console.log('📊 Dashboard stats updated');
}

/* ============================================
   NAVIGATION
   ============================================ */

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Allow external links (like client management) to navigate normally
            if (!href.startsWith('#')) {
                return; // Let browser handle the navigation
            }
            
            // Handle internal navigation (anchors)
            if (href.startsWith('#')) {
                e.preventDefault();
                
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Load appropriate section content
                console.log('Navigating to:', href);
                
                // Handle different sections
                switch(href) {
                    case '#dashboard':
                        loadDashboard();
                        break;
                    case '#appointments':
                        loadAppointmentsView();
                        break;
                    case '#clients':
                        loadClientsView();
                        break;
                    case '#services':
                        loadServicesView();
                        break;
                    case '#analytics':
                        loadAnalyticsView();
                        break;
                    case '#settings':
                        loadSettingsView();
                        break;
                    case '#logout':
                        handleLogout();
                        break;
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
            const cardId = this.getAttribute('id');
            
            // Handle Add Client quick action to open with modal trigger
            if (cardId === 'addClientQuickAction') {
                e.preventDefault();
                // Redirect to client page with URL parameter to auto-open modal
                window.location.href = 'http://localhost:5500/client/index.html?action=add';
                return;
            }
            
            if (href.startsWith('#')) {
                e.preventDefault();
                console.log('Quick action:', href);
                
                // Handle different quick actions
                switch(href) {
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

let filteredAppointments = [];
let currentFilters = {
    search: '',
    status: 'all',
    location: 'all',
    sortBy: 'date',
    sortDir: 'desc'
};

function loadAllAppointments() {
    console.log('📅 Loading all appointments from data...');
    filteredAppointments = [...adminData.appointments];
    applyFiltersAndSort();
}

function initAppointmentFilters() {
    // Search input
    const searchInput = document.getElementById('appointmentSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            currentFilters.search = e.target.value.toLowerCase();
            applyFiltersAndSort();
        });
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function(e) {
            currentFilters.status = e.target.value;
            applyFiltersAndSort();
        });
    }
    
    // Location filter
    const locationFilter = document.getElementById('locationFilter');
    if (locationFilter) {
        locationFilter.addEventListener('change', function(e) {
            currentFilters.location = e.target.value;
            applyFiltersAndSort();
        });
    }
    
    // Sortable column headers
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const sortField = this.getAttribute('data-sort');
            
            // Toggle direction if clicking same column
            if (currentFilters.sortBy === sortField) {
                currentFilters.sortDir = currentFilters.sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                currentFilters.sortBy = sortField;
                currentFilters.sortDir = 'desc';
            }
            
            // Update header styles
            sortableHeaders.forEach(h => {
                h.classList.remove('active');
                const icon = h.querySelector('.sort-icon');
                icon.className = 'bi bi-chevron-expand sort-icon';
            });
            
            this.classList.add('active');
            const icon = this.querySelector('.sort-icon');
            icon.className = currentFilters.sortDir === 'asc' ? 'bi bi-chevron-up sort-icon' : 'bi bi-chevron-down sort-icon';
            
            applyFiltersAndSort();
        });
    });
}

function applyFiltersAndSort() {
    // Start with all appointments
    let results = [...adminData.appointments];
    
    // Apply search filter
    if (currentFilters.search) {
        results = results.filter(apt => {
            const customer = adminData.customers.find(c => c.customer_id === apt.customer_id);
            if (!customer) return false;
            
            const searchText = currentFilters.search;
            const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
            const email = customer.email.toLowerCase();
            const service = apt.service_name.toLowerCase();
            
            return fullName.includes(searchText) || 
                   email.includes(searchText) || 
                   service.includes(searchText);
        });
    }
    
    // Apply status filter
    if (currentFilters.status !== 'all') {
        results = results.filter(apt => apt.status === currentFilters.status);
    }
    
    // Apply location filter
    if (currentFilters.location !== 'all') {
        results = results.filter(apt => apt.location === currentFilters.location);
    }
    
    // Apply sorting
    results.sort((a, b) => {
        const customerA = adminData.customers.find(c => c.customer_id === a.customer_id);
        const customerB = adminData.customers.find(c => c.customer_id === b.customer_id);
        
        let comparison = 0;
        
        switch(currentFilters.sortBy) {
            case 'date':
                comparison = new Date(a.appointment_date + ' ' + a.appointment_time) - 
                           new Date(b.appointment_date + ' ' + b.appointment_time);
                break;
            case 'client':
                if (!customerA || !customerB) return 0;
                comparison = `${customerA.first_name} ${customerA.last_name}`.localeCompare(
                    `${customerB.first_name} ${customerB.last_name}`
                );
                break;
            case 'service':
                comparison = a.service_name.localeCompare(b.service_name);
                break;
            case 'location':
                comparison = a.location.localeCompare(b.location);
                break;
            case 'status':
                comparison = a.status.localeCompare(b.status);
                break;
            default:
                return 0;
        }
        
        // Apply sort direction
        return currentFilters.sortDir === 'asc' ? comparison : -comparison;
    });
    
    filteredAppointments = results;
    renderAppointmentsTable();
}

function renderAppointmentsTable() {
    const tableBody = document.getElementById('appointmentsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filteredAppointments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No appointments found</td></tr>';
        return;
    }
    
    filteredAppointments.forEach(appointment => {
        const customer = adminData.customers.find(c => c.customer_id === appointment.customer_id);
        if (!customer) return;
        
        const initials = `${customer.first_name[0]}${customer.last_name[0]}`;
        const statusClass = appointment.status.toLowerCase();
        const locationIcon = appointment.location === 'studio' ? 'bi-shop' : 'bi-house';
        const locationClass = appointment.location === 'studio' ? 'studio' : 'home';
        
        const row = `
            <tr>
                <td>
                    <div class="client-info">
                        <div class="client-avatar">${initials}</div>
                        <div>
                            <div class="client-name">${customer.first_name} ${customer.last_name}</div>
                            <div class="client-email">${customer.email}</div>
                        </div>
                    </div>
                </td>
                <td><span class="service-badge">${appointment.service_name}</span></td>
                <td>
                    <div>${formatDate(appointment.appointment_date)}</div>
                    <div class="text-muted small">${appointment.appointment_time}</div>
                </td>
                <td><span class="location-badge ${locationClass}"><i class="bi ${locationIcon}"></i> ${capitalize(appointment.location)}</span></td>
                <td><span class="status-badge ${statusClass}">${capitalize(appointment.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn-sm" title="View Details" data-apt-id="${appointment.appointment_id}"><i class="bi bi-eye"></i></button>
                        <button class="icon-btn-sm" title="Edit" data-apt-id="${appointment.appointment_id}"><i class="bi bi-pencil"></i></button>
                        <button class="icon-btn-sm" title="Cancel" data-apt-id="${appointment.appointment_id}"><i class="bi bi-x-circle"></i></button>
                    </div>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
    
    // Attach event listeners to action buttons
    attachAppointmentActions();
}

function attachAppointmentActions() {
    const actionButtons = document.querySelectorAll('.icon-btn-sm');
    
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('title');
            const aptId = this.getAttribute('data-apt-id');
            const appointment = adminData.appointments.find(a => a.appointment_id === aptId);
            
            if (!appointment) return;
            
            const customer = adminData.customers.find(c => c.customer_id === appointment.customer_id);
            const clientName = customer ? `${customer.first_name} ${customer.last_name}` : 'Client';
            
            console.log(`${action} for ${clientName}`);
            
            // Handle different actions
            if (action === 'View Details') {
                viewAppointmentDetails(appointment, customer);
            } else if (action === 'Edit') {
                editAppointment(appointment, customer);
            } else if (action === 'Cancel') {
                cancelAppointment(appointment, customer);
            }
        });
    });
}

function viewAppointmentDetails(appointment, customer) {
    const details = `
Appointment Details
━━━━━━━━━━━━━━━━━━━━━━
Client: ${customer.first_name} ${customer.last_name}
Email: ${customer.email}
Phone: ${customer.phone}

Service: ${appointment.service_name}
Date: ${formatDate(appointment.appointment_date)}
Time: ${appointment.appointment_time}
Duration: ${appointment.duration_minutes} minutes
Location: ${capitalize(appointment.location)}

Status: ${capitalize(appointment.status)}
Total Amount: $${appointment.total_amount}
Deposit Paid: $${appointment.deposit_paid}
Balance Due: $${appointment.balance_due}
Payment Method: ${appointment.payment_method || 'Not specified'}

Notes: ${appointment.notes || 'None'}
    `.trim();
    
    alert(details);
}

function editAppointment(appointment, customer) {
    alert(`Edit functionality coming soon!\n\nAppointment ID: ${appointment.appointment_id}\nClient: ${customer.first_name} ${customer.last_name}\n\nThis will open an edit modal in production.`);
}

function cancelAppointment(appointment, customer) {
    const clientName = `${customer.first_name} ${customer.last_name}`;
    if (confirm(`Cancel appointment for ${clientName}?\n\nService: ${appointment.service_name}\nDate: ${formatDate(appointment.appointment_date)} at ${appointment.appointment_time}`)) {
        appointment.status = 'cancelled';
        applyFiltersAndSort();
        updateDashboardStats();
        alert('Appointment cancelled successfully!\n\nIn production, this would update Firebase and send notification to client.');
    }
}

/* ============================================
   VIEW LOADERS
   ============================================ */

function loadDashboard() {
    console.log('📊 Loading dashboard...');
    
    // Hide all views
    document.querySelectorAll('.content-view').forEach(view => view.style.display = 'none');
    
    // Show dashboard view
    const dashboardView = document.getElementById('dashboardView');
    if (dashboardView) {
        dashboardView.style.display = 'block';
    }
    
    updateDashboardStats();
}

function loadAppointmentsView() {
    console.log('📅 Loading all appointments...');
    
    // Hide all views
    document.querySelectorAll('.content-view').forEach(view => view.style.display = 'none');
    
    // Show appointments view
    const appointmentsView = document.getElementById('appointmentsView');
    if (appointmentsView) {
        appointmentsView.style.display = 'block';
    }
    
    // Load appointments data if not already loaded
    if (filteredAppointments.length === 0) {
        loadAllAppointments();
    }
}

function loadClientsView() {
    console.log('👥 Loading clients...');
    const totalVisits = adminData.customers.reduce((sum, c) => sum + c.total_visits, 0);
    alert(`Clients View\n\nTotal Clients: ${adminData.customers.length}\nTotal Visits: ${totalVisits}\n\nThis would show client management with search, filter, and detailed client profiles.`);
}

function loadServicesView() {
    console.log('🎨 Loading services & inventory...');
    const activeServices = adminData.products.filter(p => p.is_active);
    const lowStockItems = adminData.inventory.filter(i => i.needs_reorder);
    alert(`Services & Inventory\n\nActive Services: ${activeServices.length}\nInventory Items: ${adminData.inventory.length}\nLow Stock Items: ${lowStockItems.length}\n\nThis would show service catalog and inventory management.`);
}

function loadAnalyticsView() {
    console.log('📈 Loading analytics...');
    const totalRevenue = adminData.analytics.reduce((sum, a) => sum + a.total_revenue, 0);
    const totalBookings = adminData.analytics.reduce((sum, a) => sum + a.total_bookings, 0);
    alert(`Analytics Dashboard\n\nPeriod: Last 90 days\nTotal Revenue: $${totalRevenue.toLocaleString()}\nTotal Bookings: ${totalBookings}\n\nThis would show charts, graphs, and detailed analytics.`);
}

function loadSettingsView() {
    console.log('⚙️ Loading settings...');
    alert(`Business Settings\n\nTotal Settings: ${adminData.settings.length}\n\nThis would show editable business configuration including:\n- Business info\n- Booking policies\n- Payment settings\n- Notifications\n- Operations`);
}

function openNewAppointmentModal() {
    console.log('➕ Opening new appointment modal...');
    alert('New Appointment\n\nThis would open a modal with a booking form to manually create appointments for walk-in clients or phone bookings.');
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
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function formatTime(timeString) {
    return timeString;
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateStats() {
    updateDashboardStats();
}

// Auto-refresh stats every 30 seconds
setInterval(updateStats, 30000);
