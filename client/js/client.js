/* ============================================
   CLIENT MANAGEMENT JAVASCRIPT
   2025 - Client Database Management
   Data Source: excel/master.xlsx (converted to JSON)
   ============================================ */

let clientData = {
    customers: [],
    addresses: [],
    appointments: []
};

let filteredClients = [];
let currentFilters = {
    search: '',
    contact: 'all',
    sortBy: 'name',
    sortDir: 'asc'
};

let editingClientId = null;
let clientModal;
let viewClientModal;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Client Management initialized');
    
    // Initialize Bootstrap modals
    clientModal = new bootstrap.Modal(document.getElementById('clientModal'));
    viewClientModal = new bootstrap.Modal(document.getElementById('viewClientModal'));
    
    // Load data
    await loadClientData();
    
    // Initialize components
    initFilters();
    initModalHandlers();
    loadAllClients();
    updateStats();
    
    // Check for URL parameter to auto-open add client modal
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
        // Open add client modal after a short delay to ensure DOM is ready
        setTimeout(() => {
            editingClientId = null;
            document.getElementById('clientModalTitle').textContent = 'Add New Client';
            document.getElementById('clientForm').reset();
            document.getElementById('clientId').value = '';
            clientModal.show();
        }, 300);
    }
});

/* ============================================
   DATA LOADING
   ============================================ */

async function loadClientData() {
    try {
        console.log('📊 Loading client data from JSON files...');
        
        const [clientsRes, addressesRes, appointmentsRes] = await Promise.all([
            fetch('../json/clients.json').then(r => r.json()),
            fetch('../json/addresses.json').then(r => r.json()),
            fetch('../json/appointments.json').then(r => r.json())
        ]);
        
        clientData.customers = clientsRes.customers || [];
        clientData.addresses = addressesRes.addresses || [];
        clientData.appointments = appointmentsRes.appointments || [];
        
        console.log('✅ Client data loaded:', {
            customers: clientData.customers.length,
            addresses: clientData.addresses.length,
            appointments: clientData.appointments.length
        });
    } catch (error) {
        console.error('❌ Error loading data:', error);
        console.error('Error details:', error);
        alert('Failed to load client data. Please ensure the server is running.');
    }
}

/* ============================================
   STATISTICS
   ============================================ */

function updateStats() {
    // Total clients
    document.getElementById('totalClients').textContent = clientData.customers.length;
    
    // Total visits
    const totalVisits = clientData.customers.reduce((sum, c) => sum + c.total_visits, 0);
    document.getElementById('totalVisits').textContent = totalVisits;
    
    // New this month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const newThisMonth = clientData.customers.filter(c => 
        c.date_registered.startsWith(currentMonth)
    ).length;
    document.getElementById('newThisMonth').textContent = newThisMonth;
    
    // Average loyalty points
    const avgLoyalty = Math.round(
        clientData.customers.reduce((sum, c) => sum + c.loyalty_points, 0) / 
        clientData.customers.length
    ) || 0;
    document.getElementById('avgLoyalty').textContent = avgLoyalty;
}

/* ============================================
   FILTERS AND SORTING
   ============================================ */

function initFilters() {
    // Search input
    const searchInput = document.getElementById('clientSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            currentFilters.search = e.target.value.toLowerCase();
            applyFiltersAndSort();
        });
    }
    
    // Contact filter
    const contactFilter = document.getElementById('contactFilter');
    if (contactFilter) {
        contactFilter.addEventListener('change', function(e) {
            currentFilters.contact = e.target.value;
            applyFiltersAndSort();
        });
    }
    
    // Sortable column headers
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const sortField = this.getAttribute('data-sort');
            
            if (currentFilters.sortBy === sortField) {
                currentFilters.sortDir = currentFilters.sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                currentFilters.sortBy = sortField;
                currentFilters.sortDir = 'asc';
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
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
}

function loadAllClients() {
    filteredClients = [...clientData.customers];
    applyFiltersAndSort();
}

function applyFiltersAndSort() {
    let results = [...clientData.customers];
    
    // Apply search filter
    if (currentFilters.search) {
        results = results.filter(client => {
            const searchText = currentFilters.search;
            const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
            const email = client.email.toLowerCase();
            const phone = client.phone.toLowerCase();
            
            return fullName.includes(searchText) || 
                   email.includes(searchText) || 
                   phone.includes(searchText);
        });
    }
    
    // Apply contact filter
    if (currentFilters.contact !== 'all') {
        results = results.filter(client => client.preferred_contact === currentFilters.contact);
    }
    
    // Apply sorting
    results.sort((a, b) => {
        let comparison = 0;
        
        switch(currentFilters.sortBy) {
            case 'name':
                comparison = `${a.first_name} ${a.last_name}`.localeCompare(
                    `${b.first_name} ${b.last_name}`
                );
                break;
            case 'email':
                comparison = a.email.localeCompare(b.email);
                break;
            case 'registered':
                comparison = new Date(a.date_registered) - new Date(b.date_registered);
                break;
            case 'visits':
                comparison = a.total_visits - b.total_visits;
                break;
            case 'loyalty':
                comparison = a.loyalty_points - b.loyalty_points;
                break;
            default:
                return 0;
        }
        
        return currentFilters.sortDir === 'asc' ? comparison : -comparison;
    });
    
    filteredClients = results;
    renderClientsTable();
}

/* ============================================
   TABLE RENDERING
   ============================================ */

function renderClientsTable() {
    const tableBody = document.getElementById('clientsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filteredClients.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No clients found</td></tr>';
        return;
    }
    
    filteredClients.forEach(client => {
        const initials = `${client.first_name[0]}${client.last_name[0]}`;
        const preferredIcon = getContactIcon(client.preferred_contact);
        
        const row = `
            <tr>
                <td>
                    <div class="client-info-cell">
                        <div class="client-avatar-lg">${initials}</div>
                        <div class="client-details">
                            <h4>${client.first_name} ${client.last_name}</h4>
                            <p><i class="bi bi-envelope"></i> ${client.email}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <div><i class="bi bi-telephone"></i> ${client.phone}</div>
                </td>
                <td>${formatDate(client.date_registered)}</td>
                <td><span class="visits-badge">${client.total_visits}</span></td>
                <td><span class="loyalty-badge"><i class="bi bi-star-fill"></i> ${client.loyalty_points}</span></td>
                <td><span class="contact-badge"><i class="bi ${preferredIcon}"></i> ${capitalize(client.preferred_contact)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn-sm" title="View Details" onclick="viewClient('${client.customer_id}')">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="icon-btn-sm" title="Edit" onclick="editClient('${client.customer_id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="icon-btn-sm delete" title="Delete" onclick="deleteClient('${client.customer_id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

/* ============================================
   MODAL HANDLERS
   ============================================ */

function initModalHandlers() {
    // Add client button
    document.getElementById('addClientBtn').addEventListener('click', function() {
        editingClientId = null;
        document.getElementById('clientModalTitle').textContent = 'Add New Client';
        document.getElementById('clientForm').reset();
        document.getElementById('clientId').value = '';
        clientModal.show();
    });
    
    // Save client button
    document.getElementById('saveClientBtn').addEventListener('click', saveClient);
    
    // Edit from view button
    document.getElementById('editFromViewBtn').addEventListener('click', function() {
        viewClientModal.hide();
        if (editingClientId) {
            editClient(editingClientId);
        }
    });
}

function viewClient(customerId) {
    const client = clientData.customers.find(c => c.customer_id === customerId);
    if (!client) return;
    
    editingClientId = customerId;
    
    // Get client's addresses
    const addresses = clientData.addresses.filter(a => a.customer_id === customerId);
    const primaryAddress = addresses.find(a => a.is_default) || addresses[0];
    
    // Get client's appointments
    const appointments = clientData.appointments.filter(a => a.customer_id === customerId);
    const upcomingAppts = appointments.filter(a => new Date(a.appointment_date) >= new Date() && a.status !== 'cancelled');
    
    const modalBody = document.getElementById('viewClientBody');
    modalBody.innerHTML = `
        <div class="detail-section">
            <h6>Personal Information</h6>
            <div class="detail-row">
                <div class="detail-label">Full Name</div>
                <div class="detail-value">${client.first_name} ${client.last_name}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email</div>
                <div class="detail-value">${client.email}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Phone</div>
                <div class="detail-value">${client.phone}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Preferred Contact</div>
                <div class="detail-value">${capitalize(client.preferred_contact)}</div>
            </div>
        </div>

        ${primaryAddress ? `
        <div class="detail-section">
            <h6>Address</h6>
            <div class="detail-row">
                <div class="detail-label">Street</div>
                <div class="detail-value">${primaryAddress.street_address}${primaryAddress.apt_unit ? ', ' + primaryAddress.apt_unit : ''}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">City, State</div>
                <div class="detail-value">${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.zip_code}</div>
            </div>
        </div>
        ` : ''}

        <div class="detail-section">
            <h6>Account Statistics</h6>
            <div class="detail-row">
                <div class="detail-label">Date Registered</div>
                <div class="detail-value">${formatDate(client.date_registered)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Total Visits</div>
                <div class="detail-value">${client.total_visits}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Loyalty Points</div>
                <div class="detail-value">${client.loyalty_points}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Upcoming Appointments</div>
                <div class="detail-value">${upcomingAppts.length}</div>
            </div>
        </div>

        ${client.notes ? `
        <div class="detail-section">
            <h6>Notes</h6>
            <div class="detail-value">${client.notes}</div>
        </div>
        ` : ''}
    `;
    
    viewClientModal.show();
}

function editClient(customerId) {
    const client = clientData.customers.find(c => c.customer_id === customerId);
    if (!client) return;
    
    editingClientId = customerId;
    document.getElementById('clientModalTitle').textContent = 'Edit Client';
    
    // Populate form
    document.getElementById('clientId').value = client.customer_id;
    document.getElementById('firstName').value = client.first_name;
    document.getElementById('lastName').value = client.last_name;
    document.getElementById('email').value = client.email;
    document.getElementById('phone').value = client.phone;
    document.getElementById('preferredContact').value = client.preferred_contact;
    document.getElementById('loyaltyPoints').value = client.loyalty_points;
    document.getElementById('notes').value = client.notes || '';
    
    // Get address if exists
    const addresses = clientData.addresses.filter(a => a.customer_id === customerId);
    const primaryAddress = addresses.find(a => a.is_default) || addresses[0];
    
    if (primaryAddress) {
        document.getElementById('streetAddress').value = primaryAddress.street_address || '';
        document.getElementById('city').value = primaryAddress.city || '';
        document.getElementById('state').value = primaryAddress.state || '';
        document.getElementById('zipCode').value = primaryAddress.zip_code || '';
    }
    
    clientModal.show();
}

function saveClient() {
    const form = document.getElementById('clientForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const clientId = document.getElementById('clientId').value || generateId();
    const isNew = !editingClientId;
    
    const clientData = {
        customer_id: clientId,
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        preferred_contact: document.getElementById('preferredContact').value,
        loyalty_points: parseInt(document.getElementById('loyaltyPoints').value) || 0,
        notes: document.getElementById('notes').value,
        date_registered: isNew ? new Date().toISOString().split('T')[0] : 
            (window.clientData.customers.find(c => c.customer_id === clientId)?.date_registered || new Date().toISOString().split('T')[0]),
        total_visits: isNew ? 0 : (window.clientData.customers.find(c => c.customer_id === clientId)?.total_visits || 0)
    };
    
    if (isNew) {
        window.clientData.customers.push(clientData);
    } else {
        const index = window.clientData.customers.findIndex(c => c.customer_id === clientId);
        if (index !== -1) {
            window.clientData.customers[index] = clientData;
        }
    }
    
    // Handle address if provided
    const streetAddress = document.getElementById('streetAddress').value;
    if (streetAddress) {
        const addressData = {
            address_id: generateId(),
            customer_id: clientId,
            address_type: 'home',
            street_address: streetAddress,
            apt_unit: '',
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zip_code: document.getElementById('zipCode').value,
            is_default: true
        };
        
        // Remove old addresses and add new one
        window.clientData.addresses = window.clientData.addresses.filter(a => a.customer_id !== clientId);
        window.clientData.addresses.push(addressData);
    }
    
    clientModal.hide();
    loadAllClients();
    updateStats();
    
    alert(`Client ${isNew ? 'added' : 'updated'} successfully!\n\nIn production, this would save to Firebase.`);
}

function deleteClient(customerId) {
    const client = clientData.customers.find(c => c.customer_id === customerId);
    if (!client) return;
    
    if (confirm(`Delete client ${client.first_name} ${client.last_name}?\n\nThis will also remove their addresses and appointment history. This action cannot be undone.`)) {
        // Remove client
        window.clientData.customers = window.clientData.customers.filter(c => c.customer_id !== customerId);
        
        // Remove addresses
        window.clientData.addresses = window.clientData.addresses.filter(a => a.customer_id !== customerId);
        
        // Note: In production, you'd also need to handle appointments differently
        // (either delete or mark as orphaned)
        
        loadAllClients();
        updateStats();
        
        alert('Client deleted successfully!\n\nIn production, this would update Firebase.');
    }
}

/* ============================================
   EXPORT
   ============================================ */

function exportToCSV() {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Registered', 'Visits', 'Loyalty Points', 'Preferred Contact'];
    const rows = filteredClients.map(client => [
        client.first_name,
        client.last_name,
        client.email,
        client.phone,
        client.date_registered,
        client.total_visits,
        client.loyalty_points,
        client.preferred_contact
    ]);
    
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getContactIcon(contactType) {
    const icons = {
        email: 'bi-envelope-fill',
        phone: 'bi-telephone-fill',
        sms: 'bi-chat-dots-fill'
    };
    return icons[contactType] || 'bi-envelope-fill';
}

function generateId() {
    return 'CUST' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
}
