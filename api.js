// SAP Service Layer API Service
const SAPService = {
    // Asegúrate de crear env.js basado en env.example.js
    baseURL: window.ENV?.SAP_BASE_URL || '',
    credentials: {
        CompanyDB: window.ENV?.SAP_COMPANY_DB || '',
        UserName: window.ENV?.SAP_USERNAME || '',
        Password: window.ENV?.SAP_PASSWORD || ''
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
        try {
            console.log('Conectando a SAP Service Layer:', this.baseURL);
            
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

            console.log('Respuesta recibida:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error de autenticación:', response.status, errorText);
                throw new Error(`Error de autenticación: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Sesión creada:', data.SessionId);
            
            // Store session ID
            if (data.SessionId) {
                this.setSessionCookie(data.SessionId);
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            
            // Mejorar mensajes de error
            if (error.message === 'Failed to fetch') {
                throw new Error('Error de CORS o Certificado SSL: El navegador bloqueó la conexión.');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Error de red: No se puede alcanzar el servidor SAP.');
            }
            
            throw error;
        }
    },

    // Logout
    logout: async function() {
        try {
            const sessionId = this.getSessionCookie();
            console.log('Cerrando sesión...', sessionId ? 'con sesión activa' : 'sin sesión');
            
            if (sessionId) {
                await fetch(`${this.baseURL}Logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    mode: 'cors',
                    credentials: 'include',
                    cache: 'no-cache'
                });
                console.log('Sesión cerrada en SAP');
            }

            this.clearSession();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            // Aunque falle, limpiar sesión local y redirigir
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
        return await this.get(`Invoices?$select=DocNum,DocDate,DocTotal,PaidToDate&$filter=CardCode eq '${cardCode}'`);
    },

    getInvoiceLines: async function(docNum) {
        return await this.get(`Invoices(${docNum})`);
    },

    // Purchase Request specific methods
    getItems: async function() {
        return await this.get(`Items?$select=ItemCode,ItemName&$filter=PurchaseItem eq 'tYES'`);
    },

    getVendors: async function() {
        return await this.get(`BusinessPartners?$select=CardCode,CardName&$filter=CardType eq 'cSupplier'`);
    },

    getDepartments: async function() {
        return await this.get(`Departments?$select=Code,Name`);
    },

    getPurchaseRequests: async function() {
        try {
            // Intentar obtener todos los campos (sin $select la API devuelve todo)
            return await this.get(`PurchaseRequests`);
        } catch (error) {
            console.error('Error obteniendo Purchase Requests completos, intentando consulta básica:', error);
            // Fallback: solo campos básicos si falla
            return await this.get(`PurchaseRequests?$select=DocNum,DocDate,DocumentStatus`);
        }
    },

    getPurchaseRequest: async function(docNum) {
        return await this.get(`PurchaseRequests(${docNum})`);
    },

    createPurchaseRequest: async function(data) {
        /**
         * Crea una solicitud de compra (Purchase Request) en SAP Business One
         * 
         * TIPO DE CAMBIO Y MONEDA:
         * - MXN (moneda local): NO incluir DocCurrency - SAP usa moneda local por defecto
         * - USD/EUR (extranjeras): Incluir DocCurrency - SAP busca tipo de cambio en:
         *   Gestión > Tipos de cambio e índices para la fecha del documento
         * - NO es necesario especificar DocRate (tipo de cambio manual)
         * 
         * ESTRUCTURA PARA MXN:
         * {
         *   DocDate: "2026-03-03",
         *   RequiredDate: "2026-03-04",
         *   DocumentLines: [...]
         * }
         * 
         * ESTRUCTURA PARA USD/EUR:
         * {
         *   DocDate: "2026-03-03",
         *   DocCurrency: "USD",              // Solo para monedas extranjeras
         *   RequiredDate: "2026-03-04",
         *   DocumentLines: [...]
         * }
         * 
         * IMPORTANTE: Los tipos de cambio deben estar registrados en SAP 
         * para las fechas y monedas extranjeras.
         */
        return await this.post(`PurchaseRequests`, data);
    },

    updatePurchaseRequest: async function(docNum, data) {
        return await this.patch(`PurchaseRequests(${docNum})`, data);
    },

    deletePurchaseRequest: async function(docNum) {
        return await this.delete(`PurchaseRequests(${docNum})`);
    },

    // Delivery specific methods
    getDeliveries: async function(cardCode) {
        try {
            // Obtener lista de facturas del cliente (limitado a las más recientes)
            const invoicesData = await this.get(`Invoices?$select=DocNum,DocDate,CardCode,CardName&$filter=CardCode eq '${cardCode}'&$orderby=DocNum desc&$top=50`);
            
            if (!invoicesData || !invoicesData.value || invoicesData.value.length === 0) {
                return { value: [] };
            }

            // Extraer entregas únicas desde las líneas de cada factura
            // BaseType = 15 corresponde a Delivery Notes en SAP B1
            const deliveriesMap = new Map();
            
            // Procesar cada factura para obtener sus líneas
            let processedCount = 0;
            const maxToProcess = 30; // Limitar a 30 facturas para evitar demasiadas peticiones
            
            for (const invoice of invoicesData.value) {
                if (processedCount >= maxToProcess) break;
                
                try {
                    // Obtener detalle completo de la factura incluyendo líneas
                    const invoiceDetail = await this.get(`Invoices(${invoice.DocNum})`);
                    processedCount++;
                    
                    if (invoiceDetail.DocumentLines && invoiceDetail.DocumentLines.length > 0) {
                        invoiceDetail.DocumentLines.forEach(line => {
                            // Verificar si la línea hace referencia a una entrega (BaseType = 15)
                            if (line.BaseType === 15 && line.BaseEntry) {
                                const deliveryKey = line.BaseEntry;
                                
                                if (!deliveriesMap.has(deliveryKey)) {
                                    deliveriesMap.set(deliveryKey, {
                                        DocNum: line.BaseRef || line.BaseEntry,
                                        DocEntry: line.BaseEntry,
                                        BaseEntry: invoice.DocNum,
                                        BaseType: 13, // 13 = Invoice
                                        CardCode: invoice.CardCode,
                                        CardName: invoice.CardName,
                                        DocDate: invoice.DocDate,
                                        Comments: `Entrega referenciada en Factura ${invoice.DocNum}`,
                                        DocumentLines: []
                                    });
                                }
                                
                                // Agregar la línea a la entrega
                                deliveriesMap.get(deliveryKey).DocumentLines.push({
                                    ItemCode: line.ItemCode,
                                    ItemDescription: line.ItemDescription,
                                    Quantity: line.Quantity,
                                    BaseLine: line.BaseLine
                                });
                            }
                        });
                    }
                } catch (detailError) {
                    console.warn(`No se pudo obtener detalle de factura ${invoice.DocNum}:`, detailError);
                    // Continuar con la siguiente factura
                }
            }

            // Convertir el Map a array y ordenar por DocNum descendente
            const deliveries = Array.from(deliveriesMap.values()).sort((a, b) => b.DocNum - a.DocNum);
            
            console.log(`Entregas encontradas: ${deliveries.length} (procesadas ${processedCount} facturas)`);
            
            return { value: deliveries };
        } catch (error) {
            console.error('Error obteniendo entregas desde facturas:', error);
            // Si falla, devolver array vacío en lugar de error
            return { value: [] };
        }
    },

    getDeliveryDetail: async function(docNum) {
        try {
            // Intentar obtener desde DeliveryNotes directamente
            return await this.get(`DeliveryNotes(${docNum})`);
        } catch (error) {
            console.error('Error obteniendo detalle de entrega:', error);
            // Si falla, buscar en las facturas
            try {
                const invoicesData = await this.get(`Invoices?$expand=DocumentLines($select=BaseRef,BaseType,BaseEntry,BaseLine,ItemCode,ItemDescription,Quantity)`);
                
                if (invoicesData && invoicesData.value) {
                    for (const invoice of invoicesData.value) {
                        if (invoice.DocumentLines) {
                            const deliveryLines = invoice.DocumentLines.filter(line => 
                                line.BaseType === 15 && (line.BaseEntry == docNum || line.BaseRef == docNum)
                            );
                            
                            if (deliveryLines.length > 0) {
                                return {
                                    DocNum: docNum,
                                    DocEntry: docNum,
                                    DocDate: invoice.DocDate,
                                    CardCode: invoice.CardCode,
                                    CardName: invoice.CardName,
                                    BaseEntry: invoice.DocNum,
                                    Series: invoice.Series,
                                    Comments: `Entrega referenciada en Factura ${invoice.DocNum}`,
                                    DocumentLines: deliveryLines.map(line => ({
                                        ItemCode: line.ItemCode,
                                        ItemDescription: line.ItemDescription,
                                        Quantity: line.Quantity,
                                        BaseLine: line.BaseLine
                                    }))
                                };
                            }
                        }
                    }
                }
            } catch (innerError) {
                console.error('Error buscando entrega en facturas:', innerError);
            }
            
            throw error;
        }
    },

    // PDF/XML Document methods
    getInvoicePDF: async function(docNum) {
        return await this.get(`Invoices(${docNum})/PDF`);
    },

    getInvoiceXML: async function(docNum) {
        return await this.get(`Invoices(${docNum})/XML`);
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
