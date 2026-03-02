// Check if user is logged in
if (!sessionStorage.getItem('B1SESSION') || sessionStorage.getItem('userType') !== 'cliente') {
    window.location.href = 'index.html';
}

// DOM Elements
const cardCodeDisplay = document.getElementById('cardCodeDisplay');
const logoutBtn = document.getElementById('logoutBtn');
const listView = document.getElementById('listView');
const detailView = document.getElementById('detailView');
const deliveryPreviewView = document.getElementById('deliveryPreviewView');
const backBtn = document.getElementById('backBtn');
const backToListBtn = document.getElementById('backToListBtn');

// Filter elements
const filterInvoiceNum = document.getElementById('filterInvoiceNum');
const filterInvoiceType = document.getElementById('filterInvoiceType');
const filterArticle = document.getElementById('filterArticle');
const filterDateFrom = document.getElementById('filterDateFrom');
const filterDateTo = document.getElementById('filterDateTo');
const filterSeries = document.getElementById('filterSeries');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

// Tab elements
const tabBtns = document.querySelectorAll('.tab-btn');
const invoicesTab = document.getElementById('invoicesTab');
const deliveriesTab = document.getElementById('deliveriesTab');

// Invoice tab elements
const loadingList = document.getElementById('loadingList');
const errorList = document.getElementById('errorList');
const invoicesList = document.getElementById('invoicesList');

// Delivery tab elements
const loadingDeliveries = document.getElementById('loadingDeliveries');
const errorDeliveries = document.getElementById('errorDeliveries');
const deliveriesList = document.getElementById('deliveriesList');

// Detail elements
const loadingDetail = document.getElementById('loadingDetail');
const errorDetail = document.getElementById('errorDetail');
const invoiceDetail = document.getElementById('invoiceDetail');

// PDF/XML viewer elements
const viewPDFBtn = document.getElementById('viewPDFBtn');
const viewXMLBtn = document.getElementById('viewXMLBtn');
const documentViewerModal = document.getElementById('documentViewerModal');
const documentViewerTitle = document.getElementById('documentViewerTitle');
const documentViewerContent = document.getElementById('documentViewerContent');
const closeModalBtn = document.getElementById('closeModalBtn');

// Delivery preview elements
const previewNavBtns = document.querySelectorAll('.preview-nav-btn');
const deliveryDetailsView = document.getElementById('deliveryDetailsView');
const deliveryQuantityView = document.getElementById('deliveryQuantityView');
const loadingDeliveryPreview = document.getElementById('loadingDeliveryPreview');
const errorDeliveryPreview = document.getElementById('errorDeliveryPreview');
const deliveryPreviewDetails = document.getElementById('deliveryPreviewDetails');
const deliveryPreviewQuantity = document.getElementById('deliveryPreviewQuantity');

// Get user info
const cardCode = sessionStorage.getItem('cardCode');
cardCodeDisplay.textContent = cardCode;

// Store for loaded data
let allInvoices = [];
let allDeliveries = [];
let currentInvoiceDocNum = null;

// Event Listeners
logoutBtn.addEventListener('click', () => {
    SAPService.logout();
});

backBtn.addEventListener('click', () => {
    showListView();
});

backToListBtn.addEventListener('click', () => {
    showListView();
});

// Tab navigation
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
    });
});

// Preview navigation
previewNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        switchPreviewView(view);
    });
});

// Filter buttons
applyFiltersBtn.addEventListener('click', applyFilters);
clearFiltersBtn.addEventListener('click', clearFilters);

// PDF/XML viewers
viewPDFBtn.addEventListener('click', () => viewDocument('pdf'));
viewXMLBtn.addEventListener('click', () => viewDocument('xml'));
closeModalBtn.addEventListener('click', closeModal);

// Close modal on outside click
documentViewerModal.addEventListener('click', (e) => {
    if (e.target === documentViewerModal) {
        closeModal();
    }
});

// Load invoices and deliveries on page load
loadInvoices();
loadDeliveries();

// Functions

// Tab Management
function switchTab(tab) {
    // Update tab buttons
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update tab content
    if (tab === 'invoices') {
        invoicesTab.classList.add('active');
        deliveriesTab.classList.remove('active');
        document.getElementById('listViewTitle').textContent = 'Listado de Facturas';
    } else if (tab === 'deliveries') {
        invoicesTab.classList.remove('active');
        deliveriesTab.classList.add('active');
        document.getElementById('listViewTitle').textContent = 'Listado de Entregas';
    }
}

// Preview View Management
function switchPreviewView(view) {
    // Update preview nav buttons
    previewNavBtns.forEach(btn => {
        if (btn.getAttribute('data-view') === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update preview content
    if (view === 'details') {
        deliveryDetailsView.classList.add('active');
        deliveryQuantityView.classList.remove('active');
    } else if (view === 'quantity') {
        deliveryDetailsView.classList.remove('active');
        deliveryQuantityView.classList.add('active');
    }
}

// Invoice Functions
async function loadInvoices() {
    loadingList.style.display = 'block';
    errorList.textContent = '';
    invoicesList.innerHTML = '';

    try {
        const data = await SAPService.getInvoices(cardCode);
        
        loadingList.style.display = 'none';

        if (!data.value || data.value.length === 0) {
            invoicesList.innerHTML = '<p style="text-align: center; padding: 20px; color: #5A7FA0;">No se encontraron facturas para este cliente</p>';
            allInvoices = [];
            return;
        }

        allInvoices = data.value;
        displayInvoicesList(allInvoices);
    } catch (error) {
        loadingList.style.display = 'none';
        errorList.textContent = 'Error al cargar las facturas: ' + error.message;
    }
}

function displayInvoicesList(invoices) {
    if (!invoices || invoices.length === 0) {
        invoicesList.innerHTML = '<p style="text-align: center; padding: 20px; color: #5A7FA0;">No se encontraron facturas</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Número de Factura</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Pagado</th>
                <th>Saldo</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${invoices.map(invoice => `
                <tr>
                    <td>${invoice.DocNum}</td>
                    <td>${formatDate(invoice.DocDate)}</td>
                    <td>${formatCurrency(invoice.DocTotal)}</td>
                    <td>${formatCurrency(invoice.PaidToDate)}</td>
                    <td>${formatCurrency(invoice.DocTotal - invoice.PaidToDate)}</td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="viewInvoiceDetail(${invoice.DocNum})">
                            Ver Detalle
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    invoicesList.appendChild(table);
}

async function viewInvoiceDetail(docNum) {
    currentInvoiceDocNum = docNum;
    showDetailView();
    loadingDetail.style.display = 'block';
    errorDetail.textContent = '';
    invoiceDetail.innerHTML = '';

    try {
        const data = await SAPService.getInvoiceLines(docNum);
        
        loadingDetail.style.display = 'none';
        displayInvoiceDetail(data);
    } catch (error) {
        loadingDetail.style.display = 'none';
        errorDetail.textContent = 'Error al cargar el detalle: ' + error.message;
    }
}

function displayInvoiceDetail(invoice) {
    const detailHTML = `
        <div class="detail-info">
            <h3 style="color: #2E5C8A; margin-bottom: 15px;">Información General</h3>
            <div class="detail-row">
                <div class="detail-label">Número de Factura:</div>
                <div class="detail-value">${invoice.DocNum}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Fecha:</div>
                <div class="detail-value">${formatDate(invoice.DocDate)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Cliente:</div>
                <div class="detail-value">${invoice.CardCode} - ${invoice.CardName || ''}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Total:</div>
                <div class="detail-value">${formatCurrency(invoice.DocTotal)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Pagado:</div>
                <div class="detail-value">${formatCurrency(invoice.PaidToDate)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Saldo:</div>
                <div class="detail-value">${formatCurrency(invoice.DocTotal - invoice.PaidToDate)}</div>
            </div>
            ${invoice.Comments ? `
                <div class="detail-row">
                    <div class="detail-label">Comentarios:</div>
                    <div class="detail-value">${invoice.Comments}</div>
                </div>
            ` : ''}
        </div>

        ${invoice.DocumentLines && invoice.DocumentLines.length > 0 ? `
            <h3 style="color: #2E5C8A; margin-bottom: 15px;">Líneas de Factura</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.DocumentLines.map((line, idx) => `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>${line.ItemCode || 'N/A'}</td>
                                <td>${line.ItemDescription || line.Dscription || ''}</td>
                                <td>${formatNumber(line.Quantity)}</td>
                                <td>${formatCurrency(line.UnitPrice || line.Price)}</td>
                                <td>${formatCurrency(line.LineTotal)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}
    `;

    invoiceDetail.innerHTML = detailHTML;
}

// Delivery Functions
async function loadDeliveries() {
    loadingDeliveries.style.display = 'block';
    errorDeliveries.textContent = '';
    deliveriesList.innerHTML = '';

    try {
        const data = await SAPService.getDeliveries(cardCode);
        
        loadingDeliveries.style.display = 'none';

        if (!data.value || data.value.length === 0) {
            deliveriesList.innerHTML = '<p style="text-align: center; padding: 20px; color: #5A7FA0;">No se encontraron entregas para este cliente</p>';
            allDeliveries = [];
            return;
        }

        allDeliveries = data.value;
        displayDeliveriesList(allDeliveries);
    } catch (error) {
        loadingDeliveries.style.display = 'none';
        errorDeliveries.textContent = 'Error al cargar las entregas: ' + error.message;
    }
}

function displayDeliveriesList(deliveries) {
    if (!deliveries || deliveries.length === 0) {
        deliveriesList.innerHTML = '<p style="text-align: center; padding: 20px; color: #5A7FA0;">No se encontraron entregas</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Número de Entrega</th>
                <th>Fecha</th>
                <th>Factura Base</th>
                <th>Comentarios</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${deliveries.map(delivery => `
                <tr>
                    <td>${delivery.DocNum}</td>
                    <td>${formatDate(delivery.DocDate)}</td>
                    <td>${delivery.BaseEntry || 'N/A'}</td>
                    <td>${delivery.Comments || ''}</td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="viewDeliveryPreview(${delivery.DocNum})">
                            Vista Previa de la Entrega
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    deliveriesList.appendChild(table);
}

async function viewDeliveryPreview(docNum) {
    showDeliveryPreviewView();
    loadingDeliveryPreview.style.display = 'block';
    errorDeliveryPreview.textContent = '';
    deliveryPreviewDetails.innerHTML = '';
    deliveryPreviewQuantity.innerHTML = '';

    try {
        const data = await SAPService.getDeliveryDetail(docNum);
        
        loadingDeliveryPreview.style.display = 'none';
        displayDeliveryPreview(data);
    } catch (error) {
        loadingDeliveryPreview.style.display = 'none';
        errorDeliveryPreview.textContent = 'Error al cargar la vista previa: ' + error.message;
    }
}

function displayDeliveryPreview(delivery) {
    // Details View
    const detailsHTML = `
        <div class="detail-info">
            <h3 style="color: #2E5C8A; margin-bottom: 15px;">Detalles de la Entrega</h3>
            <div class="detail-row">
                <div class="detail-label">Número de Entrega:</div>
                <div class="detail-value">${delivery.DocNum}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Fecha:</div>
                <div class="detail-value">${formatDate(delivery.DocDate)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Cliente:</div>
                <div class="detail-value">${delivery.CardCode} - ${delivery.CardName || ''}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Factura Base:</div>
                <div class="detail-value">${delivery.BaseEntry || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Serie:</div>
                <div class="detail-value">${delivery.Series || 'N/A'}</div>
            </div>
            ${delivery.Comments ? `
                <div class="detail-row">
                    <div class="detail-label">Comentarios:</div>
                    <div class="detail-value">${delivery.Comments}</div>
                </div>
            ` : ''}
        </div>

        ${delivery.DocumentLines && delivery.DocumentLines.length > 0 ? `
            <h3 style="color: #2E5C8A; margin-bottom: 15px; margin-top: 20px;">Artículos Entregados</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${delivery.DocumentLines.map((line, idx) => `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>${line.ItemCode || 'N/A'}</td>
                                <td>${line.ItemDescription || ''}</td>
                                <td>${formatNumber(line.Quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}
    `;

    deliveryPreviewDetails.innerHTML = detailsHTML;

    // Quantity View
    let totalQuantity = 0;
    let totalItems = 0;
    
    if (delivery.DocumentLines && delivery.DocumentLines.length > 0) {
        totalItems = delivery.DocumentLines.length;
        totalQuantity = delivery.DocumentLines.reduce((sum, line) => sum + (line.Quantity || 0), 0);
    }

    const quantityHTML = `
        <h3 style="color: #2E5C8A; margin-bottom: 20px;">Resumen de Cantidad</h3>
        <div class="quantity-summary">
            <div class="quantity-card">
                <h4>Total de Artículos</h4>
                <div class="value">${totalItems}</div>
            </div>
            <div class="quantity-card">
                <h4>Cantidad Total</h4>
                <div class="value">${formatNumber(totalQuantity)}</div>
            </div>
            <div class="quantity-card">
                <h4>Promedio por Artículo</h4>
                <div class="value">${totalItems > 0 ? formatNumber(totalQuantity / totalItems) : '0'}</div>
            </div>
        </div>

        ${delivery.DocumentLines && delivery.DocumentLines.length > 0 ? `
            <h3 style="color: #2E5C8A; margin-bottom: 15px; margin-top: 30px;">Detalle de Cantidades</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Código de Artículo</th>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                            <th>Porcentaje</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${delivery.DocumentLines.map(line => {
                            const percentage = totalQuantity > 0 ? ((line.Quantity / totalQuantity) * 100).toFixed(2) : 0;
                            return `
                                <tr>
                                    <td>${line.ItemCode || 'N/A'}</td>
                                    <td>${line.ItemDescription || ''}</td>
                                    <td>${formatNumber(line.Quantity)}</td>
                                    <td>${percentage}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}
    `;

    deliveryPreviewQuantity.innerHTML = quantityHTML;
}

// Filter Functions
function applyFilters() {
    const filters = {
        invoiceNum: filterInvoiceNum.value.trim(),
        invoiceType: filterInvoiceType.value,
        article: filterArticle.value.trim().toLowerCase(),
        dateFrom: filterDateFrom.value,
        dateTo: filterDateTo.value,
        series: filterSeries.value.trim()
    };

    let filteredInvoices = [...allInvoices];

    // Filter by invoice number
    if (filters.invoiceNum) {
        filteredInvoices = filteredInvoices.filter(inv => 
            inv.DocNum.toString().includes(filters.invoiceNum)
        );
    }

    // Filter by date range
    if (filters.dateFrom) {
        filteredInvoices = filteredInvoices.filter(inv => 
            new Date(inv.DocDate) >= new Date(filters.dateFrom)
        );
    }

    if (filters.dateTo) {
        filteredInvoices = filteredInvoices.filter(inv => 
            new Date(inv.DocDate) <= new Date(filters.dateTo)
        );
    }

    // Note: Article and Series filtering would require loading full invoice details
    // For demonstration, we'll show a message if these filters are used
    if (filters.article || filters.series) {
        errorList.textContent = 'Nota: Los filtros por artículo y serie requieren cargar todos los detalles. Mostrando resultados parciales.';
        setTimeout(() => {
            errorList.textContent = '';
        }, 5000);
    }

    displayInvoicesList(filteredInvoices);
}

function clearFilters() {
    filterInvoiceNum.value = '';
    filterInvoiceType.value = '';
    filterArticle.value = '';
    filterDateFrom.value = '';
    filterDateTo.value = '';
    filterSeries.value = '';
    
    displayInvoicesList(allInvoices);
}

// PDF/XML Viewer Functions
async function viewDocument(type) {
    if (!currentInvoiceDocNum) {
        alert('No hay factura seleccionada');
        return;
    }

    documentViewerModal.classList.add('show');
    documentViewerContent.innerHTML = '<div class="loading">Cargando documento...</div>';

    try {
        if (type === 'pdf') {
            documentViewerTitle.textContent = 'Visor de PDF - Factura ' + currentInvoiceDocNum;
            const result = await SAPService.getInvoicePDF(currentInvoiceDocNum);
            
            if (result.url) {
                documentViewerContent.innerHTML = `
                    <iframe src="${result.url}" title="PDF Viewer"></iframe>
                    <p style="text-align: center; color: #5A7FA0; margin-top: 10px;">${result.message || 'Documento cargado desde SAP'}</p>
                `;
            } else {
                documentViewerContent.innerHTML = '<p style="color: #5A7FA0;">No se pudo cargar el PDF</p>';
            }
        } else if (type === 'xml') {
            documentViewerTitle.textContent = 'Visor de XML - Factura ' + currentInvoiceDocNum;
            const result = await SAPService.getInvoiceXML(currentInvoiceDocNum);
            
            if (result.xml) {
                // Escape HTML for display
                const escapedXML = result.xml.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                documentViewerContent.innerHTML = `
                    <pre>${escapedXML}</pre>
                    <p style="text-align: center; color: #5A7FA0; margin-top: 10px;">${result.message || 'Documento cargado desde SAP'}</p>
                `;
            } else {
                documentViewerContent.innerHTML = '<p style="color: #5A7FA0;">No se pudo cargar el XML</p>';
            }
        }
    } catch (error) {
        documentViewerContent.innerHTML = `<p style="color: #5A7FA0;">Error al cargar el documento: ${error.message}</p>`;
    }
}

function closeModal() {
    documentViewerModal.classList.remove('show');
}

// View Management
function showListView() {
    listView.style.display = 'block';
    detailView.style.display = 'none';
    deliveryPreviewView.style.display = 'none';
}

function showDetailView() {
    listView.style.display = 'none';
    detailView.style.display = 'block';
    deliveryPreviewView.style.display = 'none';
}

function showDeliveryPreviewView() {
    listView.style.display = 'none';
    detailView.style.display = 'none';
    deliveryPreviewView.style.display = 'block';
