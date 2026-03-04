// Check if user is logged in
if (!sessionStorage.getItem('B1SESSION') || sessionStorage.getItem('userType') !== 'empleado') {
    window.location.href = 'index.html';
}

// DOM Elements
const emailDisplay = document.getElementById('emailDisplay');
const logoutBtn = document.getElementById('logoutBtn');

// Views
const menuView = document.getElementById('menuView');
const createView = document.getElementById('createView');
const viewListView = document.getElementById('viewListView');
const viewDetailView = document.getElementById('viewDetailView');
const updateView = document.getElementById('updateView');
const updateDetailView = document.getElementById('updateDetailView');
const deleteView = document.getElementById('deleteView');

// Get user info
const employeeEmail = sessionStorage.getItem('employeeEmail');
emailDisplay.textContent = employeeEmail;

// Global variables
let availableItems = [];
let availableVendors = [];
let availableDepartments = [];
let selectedItems = [];
let currentRequestForUpdate = null;

// Event Listeners
logoutBtn.addEventListener('click', () => SAPService.logout());
document.getElementById('createBtn').addEventListener('click', showCreateView);
document.getElementById('viewBtn').addEventListener('click', showViewListView);
document.getElementById('updateBtn').addEventListener('click', showUpdateView);
document.getElementById('deleteBtn').addEventListener('click', showDeleteView);

// Back buttons
document.getElementById('backToMenuFromCreate').addEventListener('click', showMenuView);
document.getElementById('backToMenuFromView').addEventListener('click', showMenuView);
document.getElementById('backToMenuFromUpdate').addEventListener('click', showMenuView);
document.getElementById('backToMenuFromDelete').addEventListener('click', showMenuView);
document.getElementById('backToList').addEventListener('click', showViewListView);
document.getElementById('backToUpdateList').addEventListener('click', showUpdateView);

// Create view
document.getElementById('addItemBtn').addEventListener('click', addItemToList);
document.getElementById('submitCreateBtn').addEventListener('click', submitCreateRequest);

// Initialize
showMenuView();

// View Management Functions
function hideAllViews() {
    menuView.style.display = 'none';
    createView.style.display = 'none';
    viewListView.style.display = 'none';
    viewDetailView.style.display = 'none';
    updateView.style.display = 'none';
    updateDetailView.style.display = 'none';
    deleteView.style.display = 'none';
}

function showMenuView() {
    hideAllViews();
    menuView.style.display = 'block';
    selectedItems = [];
}

async function showCreateView() {
    hideAllViews();
    createView.style.display = 'block';
    selectedItems = [];
    
    // Set default dates
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    document.getElementById('docDate').valueAsDate = today;
    document.getElementById('requiredDate').valueAsDate = tomorrow;
    document.getElementById('dueDate').valueAsDate = nextMonth;
    document.getElementById('itemRequiredDate').valueAsDate = tomorrow;
    
    // Set default values
    document.getElementById('requesterName').value = '';
    document.getElementById('branch').value = 'Principal';
    document.getElementById('comments').value = '';
    document.getElementById('docCurrency').value = 'MXN';
    
    document.getElementById('errorCreate').textContent = '';
    document.getElementById('selectedItemsContainer').style.display = 'none';
    
    // Load items, vendors and departments
    await Promise.all([loadItems(), loadVendors(), loadDepartments()]);
}

async function showViewListView() {
    hideAllViews();
    viewListView.style.display = 'block';
    await loadPurchaseRequestsList('view');
}

async function showUpdateView() {
    hideAllViews();
    updateView.style.display = 'block';
    await loadPurchaseRequestsList('update');
}

async function showDeleteView() {
    hideAllViews();
    deleteView.style.display = 'block';
    await loadPurchaseRequestsList('delete');
}

// Create Functions
async function loadItems() {
    const loadingItems = document.getElementById('loadingItems');
    const itemSelector = document.getElementById('itemSelector');
    const itemSelect = document.getElementById('itemSelect');
    
    loadingItems.style.display = 'block';
    itemSelector.style.display = 'none';
    
    try {
        const data = await SAPService.getItems();
        availableItems = data.value || [];
        
        loadingItems.style.display = 'none';
        
        if (availableItems.length === 0) {
            document.getElementById('errorCreate').textContent = 'No se encontraron artículos disponibles';
            return;
        }
        
        itemSelect.innerHTML = '<option value="">-- Seleccione un artículo --</option>' +
            availableItems.map(item => 
                `<option value="${item.ItemCode}">${item.ItemCode} - ${item.ItemName}</option>`
            ).join('');
        
        itemSelector.style.display = 'block';
    } catch (error) {
        loadingItems.style.display = 'none';
        document.getElementById('errorCreate').textContent = 'Error al cargar artículos: ' + error.message;
    }
}

async function loadVendors() {
    const vendorSelect = document.getElementById('itemVendor');
    
    try {
        const data = await SAPService.getVendors();
        availableVendors = data.value || [];
        
        if (availableVendors.length === 0) {
            console.warn('No se encontraron proveedores disponibles');
            return;
        }
        
        vendorSelect.innerHTML = '<option value="">-- Seleccione un proveedor --</option>' +
            availableVendors.map(vendor => 
                `<option value="${vendor.CardCode}">${vendor.CardCode} - ${vendor.CardName}</option>`
            ).join('');
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
        // No mostrar error al usuario, el campo quedará con opción por defecto
    }
}

async function loadDepartments() {
    const departmentSelect = document.getElementById('department');
    
    try {
        const data = await SAPService.getDepartments();
        availableDepartments = data.value || [];
        
        if (availableDepartments.length === 0) {
            console.warn('No se encontraron departamentos disponibles');
            return;
        }
        
        departmentSelect.innerHTML = '<option value="">-- Seleccione un departamento --</option>' +
            availableDepartments.map(dept => 
                `<option value="${dept.Code}">${dept.Name}</option>`
            ).join('');
    } catch (error) {
        console.error('Error al cargar departamentos:', error);
        // No mostrar error al usuario, el campo quedará con opción por defecto
    }
}

function addItemToList() {
    const itemSelect = document.getElementById('itemSelect');
    const itemQuantity = document.getElementById('itemQuantity');
    const itemVendor = document.getElementById('itemVendor');
    const itemRequiredDate = document.getElementById('itemRequiredDate');
    const itemPrice = document.getElementById('itemPrice');
    const itemDiscount = document.getElementById('itemDiscount');
    const itemTaxCode = document.getElementById('itemTaxCode');
    const itemUoM = document.getElementById('itemUoM');
    const itemFreeText = document.getElementById('itemFreeText');
    const errorCreate = document.getElementById('errorCreate');
    
    errorCreate.textContent = '';
    
    const itemCode = itemSelect.value;
    const quantity = parseFloat(itemQuantity.value);
    
    if (!itemCode) {
        errorCreate.textContent = 'Por favor seleccione un artículo';
        return;
    }
    
    if (!quantity || quantity <= 0) {
        errorCreate.textContent = 'La cantidad debe ser mayor a 0';
        return;
    }
    
    const item = availableItems.find(i => i.ItemCode === itemCode);
    const price = parseFloat(itemPrice.value) || 0;
    const discount = parseFloat(itemDiscount.value) || 0;
    const lineTotal = price * quantity * (1 - discount / 100);
    
    // Debug: Verificar valores capturados
    console.log('Valores del formulario:', {
        itemCode,
        itemName: item?.ItemName,
        quantity,
        vendorCode: itemVendor.value,
        price
    });
    
    // Asegurar que siempre haya una fecha requerida
    const lineRequiredDate = itemRequiredDate.value || document.getElementById('requiredDate').value;
    
    if (!lineRequiredDate) {
        errorCreate.textContent = 'Debe seleccionar una fecha necesaria para el artículo';
        return;
    }
    
    selectedItems.push({
        ItemCode: itemCode,
        ItemName: item.ItemName,
        Quantity: quantity,
        VendorCode: itemVendor.value || '',
        RequiredDate: lineRequiredDate,
        UnitPrice: price,
        DiscountPercent: discount,
        TaxCode: itemTaxCode.value.trim() || '',
        UoMCode: itemUoM.value.trim() || '',
        FreeText: itemFreeText.value || '',
        LineTotal: lineTotal
    });
    
    displaySelectedItems();
    
    // Reset form
    itemSelect.value = '';
    itemQuantity.value = 1;
    itemVendor.value = '';
    itemPrice.value = '';
    itemDiscount.value = 0;
    itemTaxCode.value = '';
    itemUoM.value = '';
    itemFreeText.value = '';
}

function displaySelectedItems() {
    const container = document.getElementById('selectedItemsContainer');
    const list = document.getElementById('selectedItemsList');
    
    if (selectedItems.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    const totalBeforeDiscount = selectedItems.reduce((sum, item) => sum + (item.UnitPrice * item.Quantity), 0);
    const totalAfterDiscount = selectedItems.reduce((sum, item) => sum + item.LineTotal, 0);
    const tax = totalAfterDiscount * 0.16; // Asumiendo IVA 16%
    const totalWithTax = totalAfterDiscount + tax;
    
    const table = `
        <table>
            <thead>
                <tr>
                    <th>Número</th>
                    <th>Artículo</th>
                    <th>Descripción</th>
                    <th>Proveedor</th>
                    <th>Fecha Nec.</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>% Desc.</th>
                    <th>Impuesto</th>
                    <th>Total (ML)</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${selectedItems.map((item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.ItemCode}</td>
                        <td>${item.ItemName}</td>
                        <td>${item.VendorCode || 'N/A'}</td>
                        <td>${formatDate(item.RequiredDate)}</td>
                        <td>${formatNumber(item.Quantity)}</td>
                        <td>${formatCurrency(item.UnitPrice)}</td>
                        <td>${item.DiscountPercent}%</td>
                        <td>${item.TaxCode || 'N/A'}</td>
                        <td>${formatCurrency(item.LineTotal)}</td>
                        <td>
                            <button class="btn btn-danger btn-small" onclick="removeItem(${index})">
                                Eliminar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(74, 144, 226, 0.1); border-radius: 6px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                <div>
                    <strong style="color: #2E5C8A;">Total antes del descuento:</strong><br>
                    <span style="color: #4A90E2; font-size: 18px;">${formatCurrency(totalBeforeDiscount)}</span>
                </div>
                <div>
                    <strong style="color: #2E5C8A;">Impuesto (16%):</strong><br>
                    <span style="color: #4A90E2; font-size: 18px;">${formatCurrency(tax)}</span>
                </div>
                <div>
                    <strong style="color: #2E5C8A;">Total pago vencido:</strong><br>
                    <span style="color: #4A90E2; font-size: 20px; font-weight: 600;">${formatCurrency(totalWithTax)}</span>
                </div>
            </div>
        </div>
    `;
    
    list.innerHTML = table;
    container.style.display = 'block';
}

function removeItem(index) {
    selectedItems.splice(index, 1);
    displaySelectedItems();
}

async function submitCreateRequest() {
    const errorCreate = document.getElementById('errorCreate');
    errorCreate.textContent = '';
    
    if (selectedItems.length === 0) {
        errorCreate.textContent = 'Debe agregar al menos un artículo';
        return;
    }
    
    const requesterName = document.getElementById('requesterName').value;
    const branch = document.getElementById('branch').value;
    const department = document.getElementById('department').value;
    const docDate = document.getElementById('docDate').value;
    const requiredDate = document.getElementById('requiredDate').value;
    const dueDate = document.getElementById('dueDate').value;
    const comments = document.getElementById('comments').value;
    const docCurrency = document.getElementById('docCurrency').value;
    
    // Debug: Verificar departamento capturado
    console.log('Departamento seleccionado:', department);
    
    // Validaciones
    if (!docDate) {
        errorCreate.textContent = 'Debe seleccionar la fecha del documento';
        return;
    }
    
    if (!requiredDate) {
        errorCreate.textContent = 'Debe seleccionar una fecha necesaria';
        return;
    }
    
    // No validar RequiredDate en items - SAP lo toma del encabezado
    
    const requestData = {
        DocDate: docDate,
        RequriedDate: requiredDate,
        DocDueDate: dueDate || requiredDate,
        RequesterName: requesterName,
        RequesterBranch: branch,
        RequesterDepartment: department,
        Comments: comments || 'Solicitud generada vía Service Layer',
        RequesterEmail: employeeEmail,
        DocumentLines: selectedItems.map((item, index) => {
            const line = {
                ItemCode: item.ItemCode,
                Quantity: item.Quantity,
                RequiredDate: item.RequiredDate
            };
            
            // Agregar campos opcionales SOLO si tienen valor válido y no vacío
            if (item.UnitPrice && item.UnitPrice > 0) {
                line.UnitPrice = item.UnitPrice;
            }
            if (item.DiscountPercent && item.DiscountPercent > 0) {
                line.DiscountPercent = item.DiscountPercent;
            }
            if (item.VendorCode && item.VendorCode.trim()) {
                line.LineVendor = item.VendorCode.trim();
            }
            // TaxCode: Solo agregar si es válido (evitar 'w16' u otros inválidos)
            if (item.TaxCode && item.TaxCode.trim() && item.TaxCode.trim().length > 0) {
                const trimmedTax = item.TaxCode.trim();
                // Solo agregar códigos que parezcan válidos (no incluir 'w' minúscula que es error de tipeo)
                if (trimmedTax.toUpperCase() === trimmedTax || trimmedTax === 'IVAC16' || trimmedTax === 'IVA') {
                    line.TaxCode = trimmedTax;
                }
            }
            if (item.UoMCode && item.UoMCode.trim()) {
                line.UoMCode = item.UoMCode.trim();
            }
            if (item.FreeText && item.FreeText.trim()) {
                line.FreeText = item.FreeText.trim();
            }
            
            return line;
        })
    };
    
    // Solo agregar DocCurrency si es moneda extranjera (no MXN)
    if (docCurrency && docCurrency !== 'MXN') {
        requestData.DocCurrency = docCurrency;
    }
    
    // Debug: Ver qué se está enviando
    console.log('Request a SAP:', JSON.stringify(requestData, null, 2));
    
    try {
        document.getElementById('submitCreateBtn').disabled = true;
        const result = await SAPService.createPurchaseRequest(requestData);
        
        // Debug: Ver qué devuelve SAP
        console.log('Response de SAP:', JSON.stringify(result, null, 2));
        
        alert(`Solicitud creada exitosamente. Número de documento: ${result.DocNum}`);
        showMenuView();
    } catch (error) {
        errorCreate.textContent = 'Error al crear la solicitud: ' + error.message;
        document.getElementById('submitCreateBtn').disabled = false;
    }
}

// View Functions
async function loadPurchaseRequestsList(mode) {
    let loadingEl, errorEl, listEl;
    
    if (mode === 'view') {
        loadingEl = document.getElementById('loadingViewList');
        errorEl = document.getElementById('errorViewList');
        listEl = document.getElementById('requestsList');
    } else if (mode === 'update') {
        loadingEl = document.getElementById('loadingUpdate');
        errorEl = document.getElementById('errorUpdate');
        listEl = document.getElementById('updateRequestsList');
    } else if (mode === 'delete') {
        loadingEl = document.getElementById('loadingDelete');
        errorEl = document.getElementById('errorDelete');
        listEl = document.getElementById('deleteRequestsList');
    }
    
    loadingEl.style.display = 'block';
    errorEl.textContent = '';
    listEl.innerHTML = '';
    
    try {
        const data = await SAPService.getPurchaseRequests();
        loadingEl.style.display = 'none';
        
        if (!data.value || data.value.length === 0) {
            listEl.innerHTML = '<p style="text-align: center; padding: 20px; color: #5A7FA0;">No se encontraron solicitudes</p>';
            return;
        }
        
        displayRequestsList(data.value, mode, listEl);
    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.textContent = 'Error al cargar las solicitudes: ' + error.message;
    }
}

function displayRequestsList(requests, mode, container) {
    let actionColumn = '';
    
    if (mode === 'view') {
        actionColumn = '<th>Acciones</th>';
    } else if (mode === 'update') {
        actionColumn = '<th>Acciones</th>';
    } else if (mode === 'delete') {
        actionColumn = '<th>Acciones</th>';
    }
    
    const table = `
        <table>
            <thead>
                <tr>
                    <th>N°</th>
                    <th>Estado</th>
                    <th>Email</th>
                    <th>Solicitante</th>
                    <th>Sucursal</th>
                    <th>Departamento</th>
                    <th>Fecha Documento</th>
                    <th>Fecha Contabilización</th>
                    <th>Fecha Necesaria</th>
                    <th>Válido Hasta</th>
                    <th>Comentarios</th>
                    ${actionColumn}
                </tr>
            </thead>
            <tbody>
                ${requests.map(req => `
                    <tr>
                        <td>${req.DocNum}</td>
                        <td>${req.DocumentStatus || 'Activo'}</td>
                        <td>${req.RequesterEmail || ''}</td>
                        <td>${req.RequesterName || ''}</td>
                        <td>${req.RequesterBranch || 'N/A'}</td>
                        <td>${req.RequesterDepartment || 'N/A'}</td>
                        <td>${formatDate(req.DocDate)}</td>
                        <td>${formatDate(req.TaxDate || req.DocDate)}</td>
                        <td>${formatDate(req.RequriedDate)}</td>
                        <td>${formatDate(req.DocDueDate || req.RequriedDate)}</td>
                        <td>${req.Comments || ''}</td>
                        <td>
                            ${mode === 'view' ? 
                                `<button class="btn btn-primary btn-small" onclick="viewRequestDetail(${req.DocNum})">Ver Detalle</button>` : ''}
                            ${mode === 'update' ? 
                                `<button class="btn btn-primary btn-small" onclick="editRequest(${req.DocNum})">Modificar</button>` : ''}
                            ${mode === 'delete' ? 
                                `<button class="btn btn-danger btn-small" onclick="deleteRequest(${req.DocNum})">Eliminar</button>` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = table;
}

async function viewRequestDetail(docNum) {
    hideAllViews();
    viewDetailView.style.display = 'block';
    
    const loadingEl = document.getElementById('loadingViewDetail');
    const errorEl = document.getElementById('errorViewDetail');
    const detailEl = document.getElementById('requestDetail');
    
    loadingEl.style.display = 'block';
    errorEl.textContent = '';
    detailEl.innerHTML = '';
    
    try {
        const data = await SAPService.getPurchaseRequest(docNum);
        loadingEl.style.display = 'none';
        displayRequestDetail(data, detailEl);
    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.textContent = 'Error al cargar el detalle: ' + error.message;
    }
}

function displayRequestDetail(request, container) {
    const totalBeforeDiscount = request.DocumentLines ? 
        request.DocumentLines.reduce((sum, line) => sum + ((line.UnitPrice || 0) * (line.Quantity || 0)), 0) : 0;
    const totalAfterDiscount = request.DocumentLines ? 
        request.DocumentLines.reduce((sum, line) => sum + (line.LineTotal || 0), 0) : 0;
    const tax = totalAfterDiscount * 0.16;
    const totalWithTax = totalAfterDiscount + tax;
    
    const detailHTML = `
        <div class="detail-info">
            <h3 style="color: #2E5C8A; margin-bottom: 15px;">Información General</h3>
            <div class="filter-grid">
                <div class="detail-row">
                    <div class="detail-label">Número de Solicitud:</div>
                    <div class="detail-value">${request.DocNum}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Estado:</div>
                    <div class="detail-value">${request.DocumentStatus || 'Cerrado'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Solicitante (Usuario):</div>
                    <div class="detail-value">${request.RequesterEmail || ''}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Nombre de Solicitante:</div>
                    <div class="detail-value">${request.RequesterName || ''}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Sucursal:</div>
                    <div class="detail-value">${request.RequesterBranch || 'Principal'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Departamento:</div>
                    <div class="detail-value">${request.RequesterDepartment || 'General'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Fecha de Documento:</div>
                    <div class="detail-value">${formatDate(request.DocDate)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Fecha de Contabilización:</div>
                    <div class="detail-value">${formatDate(request.TaxDate || request.DocDate)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Fecha Necesaria:</div>
                    <div class="detail-value">${formatDate(request.RequriedDate)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Válido Hasta:</div>
                    <div class="detail-value">${formatDate(request.DocDueDate || request.RequriedDate)}</div>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Comentarios:</div>
                <div class="detail-value">${request.Comments || ''}</div>
            </div>
        </div>

        ${request.DocumentLines && request.DocumentLines.length > 0 ? `
            <h3 style="color: #2E5C8A; margin: 20px 0 15px 0;">Contenido - Líneas de Solicitud</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Artículo</th>
                            <th>Nombre del Artículo</th>
                            <th>Proveedor</th>
                            <th>Fecha Nec.</th>
                            <th>Cantidad Nec.</th>
                            <th>Precio Info</th>
                            <th>% Desc.</th>
                            <th>Impuesto</th>
                            <th>Total (ML)</th>
                            <th>Texto Libre</th>
                            <th>UoM</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${request.DocumentLines.map((line, idx) => `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>${line.ItemCode}</td>
                                <td>${line.ItemDescription || ''}</td>
                                <td>${line.VendorCode || 'N/A'}</td>
                                <td>${formatDate(line.RequiredDate)}</td>
                                <td>${formatNumber(line.Quantity)}</td>
                                <td>${formatCurrency(line.UnitPrice || 0)}</td>
                                <td>${line.DiscountPercent || 0}%</td>
                                <td>${line.TaxCode || 'N/A'}</td>
                                <td>${formatCurrency(line.LineTotal || 0)}</td>
                                <td>${line.FreeText || ''}</td>
                                <td>${line.UoMCode || 'MXP'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 20px; padding: 20px; background: rgba(74, 144, 226, 0.08); border-radius: 6px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                    <div>
                        <strong style="color: #2E5C8A;">Total antes del descuento:</strong><br>
                        <span style="color: #4A90E2; font-size: 20px; font-weight: 600;">${formatCurrency(totalBeforeDiscount)}</span>
                    </div>
                    <div>
                        <strong style="color: #2E5C8A;">Impuesto:</strong><br>
                        <span style="color: #4A90E2; font-size: 20px; font-weight: 600;">${formatCurrency(tax)}</span>
                    </div>
                    <div>
                        <strong style="color: #2E5C8A;">Total pago vencido:</strong><br>
                        <span style="color: #4A90E2; font-size: 22px; font-weight: 700;">${formatCurrency(totalWithTax)}</span>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
    
    container.innerHTML = detailHTML;
}

// Update Functions
async function editRequest(docNum) {
    hideAllViews();
    updateDetailView.style.display = 'block';
    
    const errorEl = document.getElementById('errorUpdateDetail');
    const contentEl = document.getElementById('updateDetailContent');
    
    errorEl.textContent = '';
    contentEl.innerHTML = '<div class="loading">Cargando detalle...</div>';
    
    try {
        const data = await SAPService.getPurchaseRequest(docNum);
        currentRequestForUpdate = data;
        displayUpdateForm(data, contentEl);
    } catch (error) {
        contentEl.innerHTML = '';
        errorEl.textContent = 'Error al cargar el detalle: ' + error.message;
    }
}

function displayUpdateForm(request, container) {
    const formHTML = `
        <div class="detail-info">
            <h3 style="color: #2E5C8A; margin-bottom: 15px;">Solicitud #${request.DocNum}</h3>
            <div class="detail-row">
                <div class="detail-label">Fecha:</div>
                <div class="detail-value">${formatDate(request.DocDate)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${request.RequesterEmail || ''}</div>
            </div>
        </div>

        <h3 style="color: #2E5C8A; margin: 20px 0 15px 0;">Modificar Líneas</h3>
        <p style="color: #5A7FA0; margin-bottom: 15px;">Seleccione la línea que desea modificar e ingrese la nueva cantidad.</p>
        
        ${request.DocumentLines && request.DocumentLines.length > 0 ? `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Línea</th>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Cantidad Actual</th>
                            <th>Nueva Cantidad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${request.DocumentLines.map(line => `
                            <tr>
                                <td>${line.LineNum + 1}</td>
                                <td>${line.ItemCode}</td>
                                <td>${line.ItemDescription || ''}</td>
                                <td>${formatNumber(line.Quantity)}</td>
                                <td>
                                    <input type="number" id="qty_${line.LineNum}" min="1" value="${line.Quantity}" 
                                           style="width: 100px; padding: 6px;">
                                </td>
                                <td>
                                    <button class="btn btn-primary btn-small" 
                                            onclick="updateLine(${request.DocNum}, ${line.LineNum})">
                                        Actualizar
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : '<p>No hay líneas para modificar</p>'}
    `;
    
    container.innerHTML = formHTML;
}

async function updateLine(docNum, lineNum) {
    const errorEl = document.getElementById('errorUpdateDetail');
    errorEl.textContent = '';
    
    const qtyInput = document.getElementById(`qty_${lineNum}`);
    const newQuantity = parseInt(qtyInput.value);
    
    if (!newQuantity || newQuantity < 1) {
        errorEl.textContent = 'La cantidad debe ser mayor a 0';
        return;
    }
    
    const updateData = {
        DocumentLines: [
            {
                LineNum: lineNum,
                Quantity: newQuantity
            }
        ]
    };
    
    try {
        await SAPService.updatePurchaseRequest(docNum, updateData);
        alert('Línea actualizada exitosamente');
        
        // Reload the request
        const data = await SAPService.getPurchaseRequest(docNum);
        currentRequestForUpdate = data;
        displayUpdateForm(data, document.getElementById('updateDetailContent'));
    } catch (error) {
        errorEl.textContent = 'Error al actualizar: ' + error.message;
    }
}

// Delete Function
async function deleteRequest(docNum) {
    if (!confirm(`¿Está seguro de eliminar la solicitud #${docNum}?`)) {
        return;
    }
    
    const errorEl = document.getElementById('errorDelete');
    errorEl.textContent = '';
    
    try {
        await SAPService.deletePurchaseRequest(docNum);
        alert('Solicitud eliminada exitosamente');
        await loadPurchaseRequestsList('delete');
    } catch (error) {
        errorEl.textContent = 'Error al eliminar: ' + error.message;
    }
}
