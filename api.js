// SAP Service Layer API Service
const SAPService = {
    // MODO DESARROLLO - Cambia a false para usar el servidor real
    DEVELOPMENT_MODE: false,
    
    // Asegúrate de crear env.js basado en env.example.js
    baseURL: window.ENV?.SAP_BASE_URL || '',
    credentials: {
        CompanyDB: window.ENV?.SAP_COMPANY_DB || '',
        UserName: window.ENV?.SAP_USERNAME || '',
        Password: window.ENV?.SAP_PASSWORD || ''
    },
    
    // Datos de prueba para desarrollo
    mockData: {
        // Facturas de prueba
        invoices: {
            'C40000': [
                { DocNum: 1001, DocDate: '2026-01-15', DocTotal: 15000, PaidToDate: 5000 },
                { DocNum: 1002, DocDate: '2026-01-20', DocTotal: 25000, PaidToDate: 25000 },
                { DocNum: 1003, DocDate: '2026-02-01', DocTotal: 8500, PaidToDate: 0 },
                { DocNum: 1004, DocDate: '2026-02-10', DocTotal: 12000, PaidToDate: 6000 }
            ],
            'C20000': [
                { DocNum: 2001, DocDate: '2026-01-10', DocTotal: 30000, PaidToDate: 30000 },
                { DocNum: 2002, DocDate: '2026-02-05', DocTotal: 18000, PaidToDate: 9000 }
            ]
        },
        // Detalle de facturas
        invoiceDetails: {
            1001: {
                DocNum: 1001,
                DocDate: '2026-01-15',
                DocTotal: 15000,
                PaidToDate: 5000,
                CardCode: 'C40000',
                CardName: 'Cliente Demo SA de CV',
                DocumentLines: [
                    { ItemCode: 'A001', ItemDescription: 'Laptop Dell', Quantity: 2, Price: 7500, LineTotal: 15000 }
                ]
            },
            1002: {
                DocNum: 1002,
                DocDate: '2026-01-20',
                DocTotal: 25000,
                PaidToDate: 25000,
                CardCode: 'C40000',
                CardName: 'Cliente Demo SA de CV',
                DocumentLines: [
                    { ItemCode: 'A002', ItemDescription: 'Monitor LG 27"', Quantity: 5, Price: 5000, LineTotal: 25000 }
                ]
            },
            1003: {
                DocNum: 1003,
                DocDate: '2026-02-01',
                DocTotal: 8500,
                PaidToDate: 0,
                CardCode: 'C40000',
                CardName: 'Cliente Demo SA de CV',
                DocumentLines: [
                    { ItemCode: 'A003', ItemDescription: 'Teclado Mecánico', Quantity: 10, Price: 850, LineTotal: 8500 }
                ]
            }
        },
        // Items disponibles
        items: [
            { ItemCode: 'MED01193', ItemName: 'ETIQUETA 3LC MAGNESIO COMPLEX + ACEROLA Y VIT' },
            { ItemCode: 'MED01142', ItemName: 'ETIQUETA 3LC MULTI-VITAMINICO MUJER MEXICO' },
            { ItemCode: 'MED01141', ItemName: 'ETIQUETA 3LC EV MULTI-VITAMINICO HOMBRE 60 C/' },
            { ItemCode: 'MED01262', ItemName: 'ETIQUETA 3LC BETA ALANINA 60 CAPS DE 700 mg ME' },
            { ItemCode: 'MED01241', ItemName: 'ETIQUETA 3LC L-GLUTATION LIPOSOMAL 700 mg MED' },
            { ItemCode: 'A001', ItemName: 'Laptop Dell Inspiron' },
            { ItemCode: 'A002', ItemName: 'Monitor LG 27"' },
            { ItemCode: 'A003', ItemName: 'Teclado Mecánico' },
            { ItemCode: 'A004', ItemName: 'Mouse Inalámbrico' },
            { ItemCode: 'A005', ItemName: 'Webcam HD' }
        ],
        // Entregas de prueba
        deliveries: {
            'C40000': [
                { DocNum: 5001, DocDate: '2026-01-20', BaseEntry: 1001, BaseType: 13, CardCode: 'C40000', CardName: 'Cliente Demo SA de CV', Comments: 'Entrega parcial' },
                { DocNum: 5002, DocDate: '2026-02-05', BaseEntry: 1003, BaseType: 13, CardCode: 'C40000', CardName: 'Cliente Demo SA de CV', Comments: 'Entrega completa' },
                { DocNum: 5003, DocDate: '2026-02-15', BaseEntry: 1004, BaseType: 13, CardCode: 'C40000', CardName: 'Cliente Demo SA de CV', Comments: 'Entrega urgente' }
            ],
            'C20000': [
                { DocNum: 6001, DocDate: '2026-01-25', BaseEntry: 2001, BaseType: 13, CardCode: 'C20000', CardName: 'Otro Cliente SA', Comments: 'Entrega estándar' }
            ]
        },
        deliveryDetails: {
            5001: {
                DocNum: 5001,
                DocDate: '2026-01-20',
                BaseEntry: 1001,
                BaseType: 13,
                CardCode: 'C40000',
                CardName: 'Cliente Demo SA de CV',
                Comments: 'Entrega parcial',
                Series: 1,
                DocumentLines: [
                    { LineNum: 0, ItemCode: 'A001', ItemDescription: 'Laptop Dell', Quantity: 1, BaseEntry: 1001, BaseLine: 0 }
                ]
            },
            5002: {
                DocNum: 5002,
                DocDate: '2026-02-05',
                BaseEntry: 1003,
                BaseType: 13,
                CardCode: 'C40000',
                CardName: 'Cliente Demo SA de CV',
                Comments: 'Entrega completa',
                Series: 1,
                DocumentLines: [
                    { LineNum: 0, ItemCode: 'A003', ItemDescription: 'Teclado Mecánico', Quantity: 10, BaseEntry: 1003, BaseLine: 0 }
                ]
            },
            5003: {
                DocNum: 5003,
                DocDate: '2026-02-15',
                BaseEntry: 1004,
                BaseType: 13,
                CardCode: 'C40000',
                CardName: 'Cliente Demo SA de CV',
                Comments: 'Entrega urgente',
                Series: 2,
                DocumentLines: [
                    { LineNum: 0, ItemCode: 'A001', ItemDescription: 'Laptop Dell', Quantity: 1, BaseEntry: 1004, BaseLine: 0 }
                ]
            }
        },
        // Solicitudes de compra
        purchaseRequests: [
            { 
                DocNum: 3644, 
                DocDate: '2026-02-16', 
                TaxDate: '2026-02-16',
                DocDueDate: '2026-03-16',
                RequriedDate: '2026-03-02',
                RequesterEmail: 'm.orozco@gianbbb.com',
                RequesterName: 'Melissa',
                RequesterBranch: 'Principal',
                RequesterDepartment: 'General',
                DocumentStatus: 'Cerrado',
                Owner: 'DISEÑO',
                Comments: 'Enviar correo electrónico si se agregó pedido o pedido entregado'
            },
            { 
                DocNum: 3645, 
                DocDate: '2026-02-18', 
                TaxDate: '2026-02-18',
                DocDueDate: '2026-03-18',
                RequriedDate: '2026-03-05',
                RequesterEmail: 'empleado@empresa.com',
                RequesterName: 'Juan Pérez',
                RequesterBranch: 'Principal',
                RequesterDepartment: 'Ventas',
                DocumentStatus: 'Abierto',
                Owner: 'empleado@empresa.com',
                Comments: 'Suministros de oficina urgente'
            }
        ],
        purchaseRequestDetails: {
            3644: {
                DocNum: 3644,
                DocDate: '2026-02-16',
                TaxDate: '2026-02-16',
                DocDueDate: '2026-03-16',
                RequriedDate: '2026-03-02',
                RequesterEmail: 'm.orozco@gianbbb.com',
                RequesterName: 'Melissa',
                RequesterBranch: 'Principal',
                RequesterDepartment: 'General',
                DocumentStatus: 'Cerrado',
                Owner: 'DISEÑO',
                Comments: 'Enviar correo electrónico si se agregó pedido o pedido entregado',
                DocumentLines: [
                    { 
                        LineNum: 0,
                        ItemCode: 'MED01193', 
                        ItemDescription: 'ETIQUETA 3LC MAGNESIO COMPLEX + ACEROLA Y VIT', 
                        Quantity: 20.000,
                        VendorCode: 'P0577',
                        RequiredDate: '2026-03-02',
                        UnitPrice: 1.60000,
                        DiscountPercent: 0.0000,
                        TaxCode: 'IVAC16',
                        LineTotal: 1000.00000,
                        FreeText: 'BOPP BLAN Manual',
                        UoMCode: 'MXP'
                    },
                    { 
                        LineNum: 1,
                        ItemCode: 'MED01142', 
                        ItemDescription: 'ETIQUETA 3LC MULTI-VITAMINICO MUJER MEXICO', 
                        Quantity: 4.000,
                        VendorCode: 'P0577',
                        RequiredDate: '2026-03-02',
                        UnitPrice: 1.60000,
                        DiscountPercent: 0.0000,
                        TaxCode: 'IVAC16',
                        LineTotal: 400.00000,
                        FreeText: 'BOPP BLAN Manual',
                        UoMCode: 'MXP'
                    },
                    { 
                        LineNum: 2,
                        ItemCode: 'MED01141', 
                        ItemDescription: 'ETIQUETA 3LC EV MULTI-VITAMINICO HOMBRE 60 C/', 
                        Quantity: 1.000,
                        VendorCode: 'P0577',
                        RequiredDate: '2026-03-02',
                        UnitPrice: 1.60000,
                        DiscountPercent: 0.0000,
                        TaxCode: 'IVAC16',
                        LineTotal: 600.00000,
                        FreeText: 'BOPP BLAN Manual',
                        UoMCode: 'MXP'
                    },
                    { 
                        LineNum: 3,
                        ItemCode: 'MED01262', 
                        ItemDescription: 'ETIQUETA 3LC BETA ALANINA 60 CAPS DE 700 mg ME', 
                        Quantity: 1.000,
                        VendorCode: 'P0577',
                        RequiredDate: '2026-03-02',
                        UnitPrice: 1.60000,
                        DiscountPercent: 0.0000,
                        TaxCode: 'IVAC16',
                        LineTotal: 650.00000,
                        FreeText: 'BOPP BLAN Manual',
                        UoMCode: 'MXP'
                    },
                    { 
                        LineNum: 4,
                        ItemCode: 'MED01241', 
                        ItemDescription: 'ETIQUETA 3LC L-GLUTATION LIPOSOMAL 700 mg MED', 
                        Quantity: 6.700,
                        VendorCode: 'P0577',
                        RequiredDate: '2026-03-02',
                        UnitPrice: 1.60000,
                        DiscountPercent: 0.0000,
                        TaxCode: 'IVAC16',
                        LineTotal: 1720.00000,
                        FreeText: 'BOPP BLAN Manual',
                        UoMCode: 'MXP'
                    }
                ]
            },
            3645: {
                DocNum: 3645,
                DocDate: '2026-02-18',
                TaxDate: '2026-02-18',
                DocDueDate: '2026-03-18',
                RequriedDate: '2026-03-05',
                RequesterEmail: 'empleado@empresa.com',
                RequesterName: 'Juan Pérez',
                RequesterBranch: 'Principal',
                RequesterDepartment: 'Ventas',
                DocumentStatus: 'Abierto',
                Owner: 'empleado@empresa.com',
                Comments: 'Suministros de oficina urgente',
                DocumentLines: [
                    { 
                        LineNum: 0,
                        ItemCode: 'A001', 
                        ItemDescription: 'Laptop Dell Inspiron', 
                        Quantity: 3,
                        VendorCode: 'P0001',
                        RequiredDate: '2026-03-05',
                        UnitPrice: 7500.00,
                        DiscountPercent: 5.00,
                        TaxCode: 'IVAC16',
                        LineTotal: 21375.00,
                        FreeText: 'Para equipo de ventas',
                        UoMCode: 'PZA'
                    }
                ]
            }
        }
    },

    // Get session cookie from storage
    getSessionCookie: function() {
        return sessionStorage.getItem('B1SESSION');
    },

    // Set session cookie
    setSessionCookie: function(cookie) {
        sessionStorage.setItem('B1SESSION', cookie);
    },

    // Clear session
    clearSession: function() {
        sessionStorage.removeItem('B1SESSION');
        sessionStorage.removeItem('userType');
        sessionStorage.removeItem('cardCode');
        sessionStorage.removeItem('employeeEmail');
    },

    // Login
    login: async function() {
        // Modo desarrollo: simular login exitoso
        if (this.DEVELOPMENT_MODE) {
            console.log('🔧 MODO DESARROLLO: Usando sesión simulada');
            await new Promise(resolve => setTimeout(resolve, 500)); // Simular latencia
            const mockSession = {
                SessionId: 'DEV-SESSION-' + Date.now(),
                SessionTimeout: 30
            };
            this.setSessionCookie(mockSession.SessionId);
            return mockSession;
        }
        
        // Modo producción: conexión real a SAP
        try {
            console.log('🔗 Conectando a SAP Service Layer:', this.baseURL);
            
            const response = await fetch(`${this.baseURL}Login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(this.credentials),
                mode: 'cors',
                credentials: 'include',
                cache: 'no-cache'
            });

            console.log('✅ Respuesta recibida:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error de autenticación:', response.status, errorText);
                throw new Error(`Error de autenticación: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Sesión creada:', data.SessionId);
            
            // Store session ID
            if (data.SessionId) {
                this.setSessionCookie(data.SessionId);
            }

            return data;
        } catch (error) {
            console.error('❌ Login error:', error);
            
            // Mejorar mensajes de error
            if (error.message === 'Failed to fetch') {
                throw new Error('Error de CORS o Certificado SSL:\n' +
                    'El navegador bloqueó la conexión. Posibles causas:\n' +
                    '1. CORS no configurado en el servidor SAP\n' +
                    '2. Certificado SSL autofirmado (abra: ' + this.baseURL + ' en el navegador y acéptelo)\n' +
                    '3. Firewall o proxy bloqueando la conexión\n' +
                    '\nSi Postman funciona, el problema es CORS del navegador.\n' +
                    'Contacte al administrador de SAP para habilitar CORS.');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Error de red: No se puede alcanzar el servidor SAP.\n' +
                    'Si Postman funciona, el problema es CORS o certificado SSL.');
            }
            
            throw error;
        }
    },

    // Logout
    logout: async function() {
        try {
            const sessionId = this.getSessionCookie();
            if (!sessionId) {
                this.clearSession();
                window.location.href = 'index.html';
                return;
            }

            await fetch(`${this.baseURL}Logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                credentials: 'include',
                cache: 'no-cache'
            });

            this.clearSession();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            this.clearSession();
            window.location.href = 'index.html';
        }
    },

    // Generic GET request
    get: async function(endpoint) {
        const sessionId = this.getSessionCookie();
        if (!sessionId) {
            throw new Error('No hay sesión activa');
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearSession();
                    window.location.href = 'index.html';
                    throw new Error('Sesión expirada');
                }
                throw new Error(`Error en la petición: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('GET error:', error);
            
            if (error.message === 'Failed to fetch' || (error.name === 'TypeError' && error.message.includes('fetch'))) {
                throw new Error('Error de conexión: No se puede conectar al servidor SAP. Verifique su conexión.');
            }
            
            throw error;
        }
    },

    // Generic POST request
    post: async function(endpoint, data) {
        const sessionId = this.getSessionCookie();
        if (!sessionId) {
            throw new Error('No hay sesión activa');
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearSession();
                    window.location.href = 'index.html';
                    throw new Error('Sesión expirada');
                }
                const errorData = await response.json();
                throw new Error(errorData.error?.message?.value || `Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('POST error:', error);
            
            if (error.message === 'Failed to fetch' || (error.name === 'TypeError' && error.message.includes('fetch'))) {
                throw new Error('Error de conexión: No se puede conectar al servidor SAP. Verifique su conexión.');
            }
            
            throw error;
        }
    },

    // Generic PATCH request
    patch: async function(endpoint, data) {
        const sessionId = this.getSessionCookie();
        if (!sessionId) {
            throw new Error('No hay sesión activa');
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PATCH',
                mode: 'cors',
                credentials: 'include',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearSession();
                    window.location.href = 'index.html';
                    throw new Error('Sesión expirada');
                }
                const errorData = await response.json();
                throw new Error(errorData.error?.message?.value || `Error: ${response.status}`);
            }

            // PATCH might return 204 No Content
            if (response.status === 204) {
                return { success: true };
            }

            return await response.json();
        } catch (error) {
            console.error('PATCH error:', error);
            
            if (error.message === 'Failed to fetch' || (error.name === 'TypeError' && error.message.includes('fetch'))) {
                throw new Error('Error de conexión: No se puede conectar al servidor SAP. Verifique su conexión.');
            }
            
            throw error;
        }
    },

    // Generic DELETE request
    delete: async function(endpoint) {
        const sessionId = this.getSessionCookie();
        if (!sessionId) {
            throw new Error('No hay sesión activa');
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                mode: 'cors',
                credentials: 'include',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearSession();
                    window.location.href = 'index.html';
                    throw new Error('Sesión expirada');
                }
                throw new Error(`Error: ${response.status}`);
            }

            return { success: true };
        } catch (error) {
            console.error('DELETE error:', error);
            
            if (error.message === 'Failed to fetch' || (error.name === 'TypeError' && error.message.includes('fetch'))) {
                throw new Error('Error de conexión: No se puede conectar al servidor SAP. Verifique su conexión.');
            }
            
            throw error;
        }
    },

    // Invoice specific methods
    getInvoices: async function(cardCode) {
        if (this.DEVELOPMENT_MODE) {
            console.log('🔧 MODO DESARROLLO: Obteniendo facturas simuladas para', cardCode);
            await new Promise(resolve => setTimeout(resolve, 300));
            const invoices = this.mockData.invoices[cardCode] || this.mockData.invoices['C40000'];
            return { value: invoices };
        }
        return await this.get(`/Invoices?$select=DocNum,DocDate,DocTotal,PaidToDate&$filter=CardCode eq '${cardCode}'`);
    },

    getInvoiceLines: async function(docNum) {
        if (this.DEVELOPMENT_MODE) {
            console.log('🔧 MODO DESARROLLO: Obteniendo detalle de factura', docNum);
            await new Promise(resolve => setTimeout(resolve, 300));
            return this.mockData.invoiceDetails[docNum] || this.mockData.invoiceDetails[1001];
        }
        return await this.get(`/Invoices(${docNum})`);
    },

    // Purchase Request specific methods
    getItems: async function() {
        if (this.DEVELOPMENT_MODE) {
            console.log('🔧 MODO DESARROLLO: Obteniendo items simulados');
            await new Promise(resolve => setTimeout(resolve, 300));
            return { value: this.mockData.items };
        }
        return await this.get(`/Items?$select=ItemCode,ItemName&$filter=PurchaseItem eq 'tYES'`);
    },

    getPurchaseRequests: async function() {
        if (this.DEVELOPMENT_MODE) {
            console.log('🔧 MODO DESARROLLO: Obteniendo solicitudes simuladas');
            await new Promise(resolve => setTimeout(resolve, 300));
            return { value: this.mockData.purchaseRequests };
        }
        return await this.get(`/PurchaseRequests?$select=DocNum,DocDate,TaxDate,DocDueDate,RequriedDate,RequesterEmail,RequesterName,RequesterBranch,RequesterDepartment,DocumentStatus,Owner,Comments`);
    },

    getPurchaseRequest: async function(docNum) {
        if (this.DEVELOPMENT_MODE) {
            console.log('🔧 MODO DESARROLLO: Obteniendo detalle de solicitud', docNum);
            await new Promise(resolve => setTimeout(resolve, 300));
            return this.mockData.purchaseRequestDetails[docNum] || this.mockData.purchaseRequestDetails[301];
        }
        return await this.get(`/PurchaseRequests(${docNum})`);
    },

    createPurchaseRequest: async function(data) {
        if (this.DEVELOPMENT_MODE) {
            console.log('🔧 MODO DESARROLLO: Creando solicitud simulada', data);
            await new Promise(resolve => setTimeout(resolve, 500));
            const newDocNum = 3640 + this.mockData.purchaseRequests.length + 1;
            const today = new Date().toISOString().split('T')[0];
            const newRequest = {
                DocNum: newDocNum,
                DocDate: today,
                TaxDate: today,
                DocDueDate: data.DocDueDate || data.RequriedDate,
                RequriedDate: data.RequriedDate,
                RequesterEmail: data.RequesterEmail,
                RequesterName: data.RequesterName || '',
                RequesterBranch: data.RequesterBranch || 'Principal',
                RequesterDepartment: data.RequesterDepartment || 'General',
                DocumentStatus: 'Abierto',
                Owner: data.Owner || data.RequesterEmail,
                Comments: data.Comments,
                DocumentLines: data.DocumentLines
            };
            this.mockData.purchaseRequests.push(newRequest);
            this.mockData.purchaseRequestDetails[newDocNum] = newRequest;
            return newRequest;
        }
        return await this.post(`/PurchaseRequests`, data);
    },

    updatePurchaseRequest: async function(docNum, data) {
        if (this.DEVELOPMENT_MODE) {
            console.log('🔧 MODO DESARROLLO: Actualizando solicitud', docNum, data);
            await new Promise(resolve => setTimeout(resolve, 500));
            const index = this.mockData.purchaseRequests.findIndex(pr => pr.DocNum == docNum);
            if (index !== -1) {
                this.mockData.purchaseRequests[index] = {...this.mockData.purchaseRequests[index], ...data};
            }
            if (this.mockData.purchaseRequestDetails[docNum]) {
                this.mockData.purchaseRequestDetails[docNum] = {...this.mockData.purchaseRequestDetails[docNum], ...data};
            }
            return { success: true };
        }
        return await this.patch(`/PurchaseRequests(${docNum})`, data);
    },

    deletePurchaseRequest: async function(docNum) {
        if (this.DEVELOPMENT_MODE) {
            console.log('🔧 MODO DESARROLLO: Eliminando solicitud', docNum);
            await new Promise(resolve => setTimeout(resolve, 500));
            const index = this.mockData.purchaseRequests.findIndex(pr => pr.DocNum == docNum);
            if (index !== -1) {
                this.mockData.purchaseRequests.splice(index, 1);
            }
            delete this.mockData.purchaseRequestDetails[docNum];
            return { success: true };
        }
        return await this.delete(`/PurchaseRequests(${docNum})`);
    },

    // Delivery specific methods
    getDeliveries: async function(cardCode) {
        if (this.DEVELOPMENT_MODE) {
            console.log('🔧 MODO DESARROLLO: Obteniendo entregas simuladas para', cardCode);
            await new Promise(resolve => setTimeout(resolve, 300));
            const deliveries = this.mockData.deliveries[cardCode] || this.mockData.deliveries['C40000'];
            return { value: deliveries };
        }
        return await this.get(`/DeliveryNotes?$select=DocNum,DocDate,BaseEntry,BaseType,CardCode,CardName,Comments&$filter=CardCode eq '${cardCode}'`);
    },

    getDeliveryDetail: async function(docNum) {
        if (this.DEVELOPMENT_MODE) {
            console.log('🔧 MODO DESARROLLO: Obteniendo detalle de entrega', docNum);
            await new Promise(resolve => setTimeout(resolve, 300));
            return this.mockData.deliveryDetails[docNum] || this.mockData.deliveryDetails[5001];
        }
        return await this.get(`/DeliveryNotes(${docNum})`);
    },

    // PDF/XML Document methods
    getInvoicePDF: async function(docNum) {
        if (this.DEVELOPMENT_MODE) {
            console.log('🔧 MODO DESARROLLO: Simulando obtención de PDF para factura', docNum);
            await new Promise(resolve => setTimeout(resolve, 500));
            // Simular URL de PDF
            return { 
                success: true, 
                url: `data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjE8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9UaW1lcy1Sb21hbj4+Pj4+Pj4+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDE1IDAwMDAwIG4NCjAwMDAwMDAwNjQgMDAwMDAgbg0KMDAwMDAwMDExNCAwMDAwMCBuDQp0cmFpbGVyCjw8L1NpemUgNC9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjI3OAolJUVPRgo=`,
                message: 'PDF generado (simulado)'
            };
        }
        // En producción, usar el endpoint de SAP para obtener PDF
        return await this.get(`/Invoices(${docNum})/PDF`);
    },

    getInvoiceXML: async function(docNum) {
        if (this.DEVELOPMENT_MODE) {
            console.log('🔧 MODO DESARROLLO: Simulando obtención de XML para factura', docNum);
            await new Promise(resolve => setTimeout(resolve, 500));
            // Simular XML
            const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Factura>
    <NumeroFactura>${docNum}</NumeroFactura>
    <Fecha>2026-02-23</Fecha>
    <Total>15000.00</Total>
    <Cliente>C40000</Cliente>
</Factura>`;
            return { 
                success: true, 
                xml: xmlContent,
                message: 'XML generado (simulado)'
            };
        }
        // En producción, usar el endpoint de SAP para obtener XML
        return await this.get(`/Invoices(${docNum})/XML`);
    }
};

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

function formatNumber(number) {
    if (number === null || number === undefined) return '';
    return new Intl.NumberFormat('es-MX').format(number);
}
