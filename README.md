# Portal SAP - Service Layer

## Descripción

Aplicación web profesional para gestión de Facturas y Solicitudes de Compra integrada con SAP Business One mediante Service Layer.

## Características

### Módulo de Facturas (Clientes)
- Login con CardCode (identificador SAP)
- Visualización de listado de facturas del cliente
- Detalle completo de cada factura con líneas de productos
- Navegación intuitiva entre listado y detalle
- Cierre de sesión seguro

### Módulo de Solicitudes de Compra (Empleados)
- CRUD completo de solicitudes de compra
- **Crear**: Selección de artículos desde catálogo SAP
- **Consultar**: Ver listado y detalle de solicitudes
- **Modificar**: Actualizar cantidades de líneas
- **Eliminar**: Eliminar solicitudes existentes

## Diseño

- Minimalista y profesional
- Colores grises y azules claros con transparencias
- Responsive y adaptable a diferentes dispositivos

## Uso

1. Abra `index.html` en su navegador web
2. Seleccione tipo de usuario:
   - **Cliente**: Ingrese su CardCode (ej: C40000)
   - **Empleado**: Ingrese su email
3. Acceda al portal correspondiente

## Archivos

- `index.html` - Página de login
- `facturas.html` - Portal de facturas para clientes
- `solicitudes.html` - Portal de solicitudes para empleados
- `style.css` - Estilos compartidos
- `api.js` - Servicio de comunicación con SAP Service Layer
- `facturas.js` - Lógica del módulo de facturas
- `solicitudes.js` - Lógica del módulo de solicitudes

## Configuración SAP Service Layer

- Depende orghanización

## Endpoints Utilizados

### Autenticación
- POST `/Login` - Iniciar sesión
- POST `/Logout` - Cerrar sesión

### Facturas
- GET `/Invoices?$select=DocNum,DocDate,DocTotal,PaidToDate&$filter=CardCode eq '{cardCode}'`
- GET `/Invoices({docNum})`

### Solicitudes de Compra
- GET `/Items?$select=ItemCode,ItemName&$filter=PurchaseItem eq 'tYES'`
- GET `/PurchaseRequests?$select=DocNum,DocDate,RequesterEmail,Comments`
- GET `/PurchaseRequests({docNum})`
- POST `/PurchaseRequests`
- PATCH `/PurchaseRequests({docNum})`
- DELETE `/PurchaseRequests({docNum})`

## Requisitos

- Navegador web moderno (Chrome, Firefox, Edge)
- Acceso a internet para conectar con SAP Service Layer
- JavaScript habilitado

## Notas Técnicas

- La aplicación usa `sessionStorage` para mantener la sesión
- Las cookies de sesión SAP se gestionan automáticamente
- Los errores de autenticación redirigen automáticamente al login
- Formato de moneda: Peso Mexicano (MXN)
- Formato de fecha: Español (México)

## Seguridad

**Importante**: Esta es una aplicación de demostración. Para producción:
- No almacene credenciales en el código
- Implemente un backend para gestionar autenticación
- Use HTTPS
- Valide todos los inputs del usuario
- Implemente manejo de errores más robusto
