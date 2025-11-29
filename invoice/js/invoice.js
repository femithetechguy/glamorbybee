/* ============================================
   GLAMORBYBEE INVOICE SYSTEM JAVASCRIPT
   2025 - Invoice Management
   ============================================ */

let invoiceData = {
    services: [],
    invoices: [],
    clients: []
};

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Invoice system initialized');
    
    // Load data
    await loadInvoiceData();
    
    // Set default date to today
    setDefaultDate();
    
    // Initialize form handlers
    initServiceHandlers();
    initCalculations();
    initFormSubmission();
    initPreview();
});

/* ============================================
   DATA LOADING
   ============================================ */

async function loadInvoiceData() {
    try {
        console.log('📄 Loading invoice data...');
        const [servicesRes, invoicesRes, clientsRes] = await Promise.all([
            fetch('../json/services.json').then(r => r.json()),
            fetch('../json/invoices.json').then(r => r.json()),
            fetch('../json/clients.json').then(r => r.json())
        ]);
        
        invoiceData.services = servicesRes.services || [];
        invoiceData.invoices = invoicesRes.invoices || [];
        invoiceData.clients = clientsRes.customers || [];
        
        console.log('✅ Invoice data loaded:', {
            services: invoiceData.services.length,
            invoices: invoiceData.invoices.length,
            clients: invoiceData.clients.length
        });
    } catch (error) {
        console.error('❌ Error loading invoice data:', error);
    }
}

/* ============================================
   DEFAULT VALUES
   ============================================ */

function setDefaultDate() {
    const dateInput = document.getElementById('invoiceDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.setAttribute('min', today);
}

/* ============================================
   SERVICE MANAGEMENT
   ============================================ */

function initServiceHandlers() {
    const addServiceBtn = document.getElementById('addServiceBtn');
    const servicesContainer = document.getElementById('servicesContainer');
    
    // Add service button
    addServiceBtn.addEventListener('click', function() {
        addServiceItem();
    });
    
    // Initialize first service item
    attachServiceItemHandlers();
}

function addServiceItem() {
    const servicesContainer = document.getElementById('servicesContainer');
    
    // Generate service options from invoiceData
    const serviceOptions = invoiceData.services.map(service => {
        const price = typeof service.price === 'string' ? service.price.replace('$', '') : service.price;
        return `<option value="${service.name}" data-price="${price}">${service.name} ($${price})</option>`;
    }).join('');
    
    const serviceHTML = `
        <div class="service-item">
            <div class="row g-3 align-items-end">
                <div class="col-md-5">
                    <label class="form-label">Service *</label>
                    <select class="form-select form-select-lg service-select" required>
                        <option value="">Select service</option>
                        ${serviceOptions}
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Quantity *</label>
                    <input type="number" class="form-control form-control-lg service-quantity" value="1" min="1" required>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Price ($) *</label>
                    <input type="number" class="form-control form-control-lg service-price" placeholder="0.00" step="0.01" required>
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn-remove" title="Remove service">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    servicesContainer.insertAdjacentHTML('beforeend', serviceHTML);
    attachServiceItemHandlers();
    calculateTotals();
}

function attachServiceItemHandlers() {
    // Service select handlers (auto-fill price)
    document.querySelectorAll('.service-select').forEach(select => {
        if (!select.dataset.initialized) {
            select.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const price = selectedOption.dataset.price;
                const priceInput = this.closest('.service-item').querySelector('.service-price');
                if (price) {
                    priceInput.value = price;
                    calculateTotals();
                }
            });
            select.dataset.initialized = 'true';
        }
    });
    
    // Quantity and price change handlers
    document.querySelectorAll('.service-quantity, .service-price').forEach(input => {
        if (!input.dataset.initialized) {
            input.addEventListener('input', calculateTotals);
            input.dataset.initialized = 'true';
        }
    });
    
    // Remove button handlers
    document.querySelectorAll('.btn-remove').forEach(btn => {
        if (!btn.dataset.initialized) {
            btn.addEventListener('click', function() {
                const serviceItems = document.querySelectorAll('.service-item');
                if (serviceItems.length > 1) {
                    this.closest('.service-item').remove();
                    calculateTotals();
                } else {
                    alert('You must have at least one service item.');
                }
            });
            btn.dataset.initialized = 'true';
        }
    });
}

/* ============================================
   CALCULATIONS
   ============================================ */

function initCalculations() {
    const taxInput = document.getElementById('taxRate');
    const discountInput = document.getElementById('discountAmount');
    
    taxInput.addEventListener('input', calculateTotals);
    discountInput.addEventListener('input', calculateTotals);
    
    // Initial calculation
    calculateTotals();
}

function calculateTotals() {
    let subtotal = 0;
    
    // Calculate subtotal from all service items
    document.querySelectorAll('.service-item').forEach(item => {
        const quantity = parseFloat(item.querySelector('.service-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.service-price').value) || 0;
        subtotal += quantity * price;
    });
    
    // Get tax rate and discount
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const discount = parseFloat(document.getElementById('discountAmount').value) || 0;
    
    // Calculate values
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount - discount;
    const deposit = total * 0.30; // 30% deposit
    const balance = total - deposit;
    
    // Update display
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = `$${taxAmount.toFixed(2)}`;
    document.getElementById('discountTotal').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    document.getElementById('depositAmount').textContent = `$${deposit.toFixed(2)}`;
    document.getElementById('balanceAmount').textContent = `$${balance.toFixed(2)}`;
}

/* ============================================
   PREVIEW
   ============================================ */

function initPreview() {
    const previewBtn = document.getElementById('previewBtn');
    const closePreviewBtn = document.getElementById('closePreview');
    const invoicePreview = document.getElementById('invoicePreview');
    
    previewBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (validateForm()) {
            generatePreview();
            invoicePreview.classList.add('active');
        }
    });
    
    closePreviewBtn.addEventListener('click', function() {
        invoicePreview.classList.remove('active');
    });
    
    // Close on background click
    invoicePreview.addEventListener('click', function(e) {
        if (e.target === invoicePreview) {
            invoicePreview.classList.remove('active');
        }
    });
}

function generatePreview() {
    // Client information
    document.getElementById('previewClientName').textContent = document.getElementById('clientName').value;
    document.getElementById('previewClientEmail').textContent = document.getElementById('clientEmail').value;
    const phone = document.getElementById('clientPhone').value;
    document.getElementById('previewClientPhone').textContent = phone || '';
    
    // Invoice date
    const invoiceDate = new Date(document.getElementById('invoiceDate').value);
    document.getElementById('previewDate').textContent = invoiceDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    // Generate invoice number (timestamp-based)
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    document.getElementById('previewInvoiceNumber').textContent = invoiceNumber;
    
    // Service items
    const previewItems = document.getElementById('previewItems');
    previewItems.innerHTML = '';
    
    document.querySelectorAll('.service-item').forEach(item => {
        const service = item.querySelector('.service-select').value;
        const quantity = item.querySelector('.service-quantity').value;
        const price = parseFloat(item.querySelector('.service-price').value);
        const lineTotal = quantity * price;
        
        const row = `
            <tr>
                <td>${service}</td>
                <td>${quantity}</td>
                <td>$${price.toFixed(2)}</td>
                <td>$${lineTotal.toFixed(2)}</td>
            </tr>
        `;
        previewItems.insertAdjacentHTML('beforeend', row);
    });
    
    // Totals
    document.getElementById('previewSubtotal').textContent = document.getElementById('subtotal').textContent;
    document.getElementById('previewTaxRate').textContent = document.getElementById('taxRate').value;
    document.getElementById('previewTax').textContent = document.getElementById('taxAmount').textContent;
    document.getElementById('previewDiscount').textContent = document.getElementById('discountTotal').textContent;
    document.getElementById('previewTotal').textContent = document.getElementById('totalAmount').textContent;
    document.getElementById('previewDeposit').textContent = document.getElementById('depositAmount').textContent;
    document.getElementById('previewBalance').textContent = document.getElementById('balanceAmount').textContent;
    
    // Notes
    const notes = document.getElementById('invoiceNotes').value;
    const notesSection = document.getElementById('previewNotesSection');
    if (notes) {
        document.getElementById('previewNotes').textContent = notes;
        notesSection.style.display = 'block';
    } else {
        notesSection.style.display = 'none';
    }
}

/* ============================================
   FORM SUBMISSION
   ============================================ */

function initFormSubmission() {
    const form = document.getElementById('invoiceForm');
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            generatePDF();
        }
    });
    
    sendEmailBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (validateForm()) {
            sendInvoiceEmail();
        }
    });
}

function validateForm() {
    const clientName = document.getElementById('clientName').value.trim();
    const clientEmail = document.getElementById('clientEmail').value.trim();
    const invoiceDate = document.getElementById('invoiceDate').value;
    
    if (!clientName) {
        alert('Please enter client name');
        return false;
    }
    
    if (!clientEmail) {
        alert('Please enter client email');
        return false;
    }
    
    if (!invoiceDate) {
        alert('Please select invoice date');
        return false;
    }
    
    // Check if at least one service has valid data
    const serviceItems = document.querySelectorAll('.service-item');
    let hasValidService = false;
    
    serviceItems.forEach(item => {
        const service = item.querySelector('.service-select').value;
        const price = item.querySelector('.service-price').value;
        if (service && price && parseFloat(price) > 0) {
            hasValidService = true;
        }
    });
    
    if (!hasValidService) {
        alert('Please add at least one service with a valid price');
        return false;
    }
    
    return true;
}

function generatePDF() {
    console.log('Generating PDF...');
    // In production, this would use a library like jsPDF or html2pdf
    // For now, show preview and provide print option
    generatePreview();
    document.getElementById('invoicePreview').classList.add('active');
    
    setTimeout(() => {
        if (confirm('Open print dialog to save as PDF?')) {
            window.print();
        }
    }, 500);
}

function sendInvoiceEmail() {
    console.log('Sending invoice via email...');
    // In production, this would integrate with EmailJS or backend API
    const clientEmail = document.getElementById('clientEmail').value;
    const clientName = document.getElementById('clientName').value;
    
    alert(`Invoice will be sent to ${clientName} at ${clientEmail}\n\nNote: Email integration requires backend setup.`);
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

function formatCurrency(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
}

function generateInvoiceNumber() {
    const timestamp = Date.now();
    return `INV-${timestamp.toString().slice(-6)}`;
}
