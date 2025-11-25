/* ============================================
   INVOICE MANAGEMENT JAVASCRIPT
   2025 - Invoice List & Management
   Data Source: excel/master.xlsx (converted to JSON)
   ============================================ */

let invoiceData = {
    invoices: [],
    customers: [],
    appointments: []
};

let filteredInvoices = [];
let currentFilters = {
    search: '',
    status: 'all',
    sortBy: 'number',
    sortDir: 'desc'
};

let viewInvoiceModal;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Invoice Management initialized');
    
    // Initialize Bootstrap modal
    viewInvoiceModal = new bootstrap.Modal(document.getElementById('viewInvoiceModal'));
    
    // Load data
    await loadInvoiceData();
    
    // Initialize components
    initFilters();
    loadAllInvoices();
    updateStats();
});

/* ============================================
   DATA LOADING
   ============================================ */

async function loadInvoiceData() {
    try {
        console.log('📊 Loading invoice data from JSON files...');
        
        const [masterData] = await Promise.all([
            fetch('../json/master_data.json').then(r => r.json())
        ]);
        
        invoiceData.invoices = masterData.invoices || [];
        invoiceData.customers = masterData.customers || [];
        invoiceData.appointments = masterData.appointments || [];
        
        console.log('✅ Invoice data loaded:', {
            invoices: invoiceData.invoices.length,
            customers: invoiceData.customers.length
        });
    } catch (error) {
        console.error('❌ Error loading data:', error);
        alert('Failed to load invoice data. Please ensure the server is running.');
    }
}

/* ============================================
   STATISTICS
   ============================================ */

function updateStats() {
    // Total invoices
    document.getElementById('totalInvoices').textContent = invoiceData.invoices.length;
    
    // Paid invoices total
    const paidTotal = invoiceData.invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total_amount, 0);
    document.getElementById('paidInvoices').textContent = `$${paidTotal.toLocaleString()}`;
    
    // Pending invoices total
    const pendingTotal = invoiceData.invoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.total_amount, 0);
    document.getElementById('pendingInvoices').textContent = `$${pendingTotal.toLocaleString()}`;
    
    // Overdue invoices total
    const today = new Date();
    const overdueTotal = invoiceData.invoices
        .filter(inv => {
            const dueDate = new Date(inv.due_date);
            return inv.status === 'pending' && dueDate < today;
        })
        .reduce((sum, inv) => sum + inv.total_amount, 0);
    document.getElementById('overdueInvoices').textContent = `$${overdueTotal.toLocaleString()}`;
}

/* ============================================
   FILTERS AND SORTING
   ============================================ */

function initFilters() {
    // Search input
    const searchInput = document.getElementById('invoiceSearch');
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
    
    // Sortable column headers
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const sortField = this.getAttribute('data-sort');
            
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
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    
    // Modal buttons
    document.getElementById('printInvoiceBtn').addEventListener('click', printInvoice);
    document.getElementById('emailInvoiceBtn').addEventListener('click', emailInvoice);
}

function loadAllInvoices() {
    filteredInvoices = [...invoiceData.invoices];
    applyFiltersAndSort();
}

function applyFiltersAndSort() {
    let results = [...invoiceData.invoices];
    
    // Apply search filter
    if (currentFilters.search) {
        results = results.filter(invoice => {
            const searchText = currentFilters.search;
            const customer = invoiceData.customers.find(c => c.customer_id === invoice.customer_id);
            const customerName = customer ? `${customer.first_name} ${customer.last_name}`.toLowerCase() : '';
            const customerEmail = customer ? customer.email.toLowerCase() : '';
            const invoiceNumber = invoice.invoice_number.toLowerCase();
            
            return invoiceNumber.includes(searchText) || 
                   customerName.includes(searchText) || 
                   customerEmail.includes(searchText);
        });
    }
    
    // Apply status filter
    if (currentFilters.status !== 'all') {
        const today = new Date();
        results = results.filter(invoice => {
            if (currentFilters.status === 'overdue') {
                const dueDate = new Date(invoice.due_date);
                return invoice.status === 'pending' && dueDate < today;
            }
            return invoice.status === currentFilters.status;
        });
    }
    
    // Apply sorting
    results.sort((a, b) => {
        let comparison = 0;
        
        switch(currentFilters.sortBy) {
            case 'number':
                comparison = a.invoice_number.localeCompare(b.invoice_number);
                break;
            case 'client':
                const customerA = invoiceData.customers.find(c => c.customer_id === a.customer_id);
                const customerB = invoiceData.customers.find(c => c.customer_id === b.customer_id);
                const nameA = customerA ? `${customerA.first_name} ${customerA.last_name}` : '';
                const nameB = customerB ? `${customerB.first_name} ${customerB.last_name}` : '';
                comparison = nameA.localeCompare(nameB);
                break;
            case 'date':
                comparison = new Date(a.issue_date) - new Date(b.issue_date);
                break;
            case 'due':
                comparison = new Date(a.due_date) - new Date(b.due_date);
                break;
            case 'amount':
                comparison = a.total_amount - b.total_amount;
                break;
            default:
                return 0;
        }
        
        return currentFilters.sortDir === 'asc' ? comparison : -comparison;
    });
    
    filteredInvoices = results;
    renderInvoicesTable();
}

/* ============================================
   TABLE RENDERING
   ============================================ */

function renderInvoicesTable() {
    const tableBody = document.getElementById('invoicesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filteredInvoices.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No invoices found</td></tr>';
        return;
    }
    
    filteredInvoices.forEach(invoice => {
        const customer = invoiceData.customers.find(c => c.customer_id === invoice.customer_id);
        const customerName = customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown Client';
        const customerEmail = customer ? customer.email : '';
        
        // Determine status (including overdue)
        let status = invoice.status;
        let statusClass = invoice.status;
        if (invoice.status === 'pending') {
            const dueDate = new Date(invoice.due_date);
            const today = new Date();
            if (dueDate < today) {
                status = 'overdue';
                statusClass = 'overdue';
            }
        }
        
        const row = `
            <tr>
                <td><span class="invoice-number">${invoice.invoice_number}</span></td>
                <td>
                    <div class="client-name">${customerName}</div>
                    <div class="client-email">${customerEmail}</div>
                </td>
                <td>${formatDate(invoice.issue_date)}</td>
                <td>${formatDate(invoice.due_date)}</td>
                <td><span class="amount-badge">$${invoice.total_amount.toFixed(2)}</span></td>
                <td><span class="status-badge ${statusClass}">${capitalize(status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn-sm" title="View Details" onclick="viewInvoice('${invoice.invoice_id}')">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="icon-btn-sm" title="Download PDF" onclick="downloadInvoice('${invoice.invoice_id}')">
                            <i class="bi bi-download"></i>
                        </button>
                        <button class="icon-btn-sm delete" title="Delete" onclick="deleteInvoice('${invoice.invoice_id}')">
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
   INVOICE ACTIONS
   ============================================ */

function viewInvoice(invoiceId) {
    const invoice = invoiceData.invoices.find(inv => inv.invoice_id === invoiceId);
    if (!invoice) return;
    
    const customer = invoiceData.customers.find(c => c.customer_id === invoice.customer_id);
    const customerName = customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown Client';
    
    const modalBody = document.getElementById('viewInvoiceBody');
    modalBody.innerHTML = `
        <div class="invoice-preview">
            <div class="invoice-header-section">
                <div class="invoice-brand">
                    <h3>GlamorByBee</h3>
                    <p>Professional Beauty Services</p>
                </div>
                <div class="invoice-number-display">
                    <h4>${invoice.invoice_number}</h4>
                    <p>Issue Date: ${formatDate(invoice.issue_date)}</p>
                    <p>Due Date: ${formatDate(invoice.due_date)}</p>
                </div>
            </div>

            <div class="invoice-parties">
                <div class="party-section">
                    <h6>Bill To</h6>
                    <p><strong>${customerName}</strong></p>
                    <p>${customer?.email || ''}</p>
                    <p>${customer?.phone || ''}</p>
                </div>
                <div class="party-section">
                    <h6>From</h6>
                    <p><strong>GlamorByBee</strong></p>
                    <p>contact@glamorbybee.com</p>
                    <p>(555) 123-4567</p>
                </div>
            </div>

            <table class="invoice-items-table">
                <thead>
                    <tr>
                        <th>Service</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Beauty Services</td>
                        <td style="text-align: right;">$${(invoice.total_amount - invoice.tax_amount).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="invoice-totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>$${(invoice.total_amount - invoice.tax_amount).toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Tax:</span>
                    <span>$${invoice.tax_amount.toFixed(2)}</span>
                </div>
                <div class="total-row grand-total">
                    <span>Total:</span>
                    <span>$${invoice.total_amount.toFixed(2)}</span>
                </div>
            </div>

            ${invoice.notes ? `
            <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                <h6>Notes</h6>
                <p>${invoice.notes}</p>
            </div>
            ` : ''}

            <div style="margin-top: 2rem; padding: 1rem; background: var(--light); border-radius: 8px;">
                <strong>Payment Status:</strong> <span class="status-badge ${invoice.status}">${capitalize(invoice.status)}</span>
            </div>
        </div>
    `;
    
    viewInvoiceModal.show();
}

function downloadInvoice(invoiceId) {
    alert('Download PDF feature coming soon!\n\nThis will generate and download a PDF version of the invoice.');
}

function deleteInvoice(invoiceId) {
    const invoice = invoiceData.invoices.find(inv => inv.invoice_id === invoiceId);
    if (!invoice) return;
    
    if (confirm(`Delete invoice ${invoice.invoice_number}?\n\nThis action cannot be undone.`)) {
        invoiceData.invoices = invoiceData.invoices.filter(inv => inv.invoice_id !== invoiceId);
        
        loadAllInvoices();
        updateStats();
        
        alert('Invoice deleted successfully!\n\nIn production, this would update Firebase.');
    }
}

function printInvoice() {
    window.print();
}

function emailInvoice() {
    alert('Email invoice feature coming soon!\n\nThis will send the invoice to the client\'s email address.');
}

/* ============================================
   EXPORT
   ============================================ */

function exportToCSV() {
    const headers = ['Invoice #', 'Client', 'Email', 'Issue Date', 'Due Date', 'Amount', 'Tax', 'Total', 'Status'];
    const rows = filteredInvoices.map(invoice => {
        const customer = invoiceData.customers.find(c => c.customer_id === invoice.customer_id);
        const customerName = customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown';
        const customerEmail = customer ? customer.email : '';
        
        return [
            invoice.invoice_number,
            customerName,
            customerEmail,
            invoice.issue_date,
            invoice.due_date,
            (invoice.total_amount - invoice.tax_amount).toFixed(2),
            invoice.tax_amount.toFixed(2),
            invoice.total_amount.toFixed(2),
            invoice.status
        ];
    });
    
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
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
