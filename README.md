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
- **Gestión de Moneda y Tipo de Cambio**: Usa automáticamente la configuración de SAP

## Gestión de Tipo de Cambio

### Configuración en SAP Business One

El portal permite seleccionar la moneda del documento y utiliza automáticamente los tipos de cambio configurados en SAP Business One.

**Configuración de Tipos de Cambio**:
1. Abrir **SAP Business One** (cliente de escritorio)
2. Navegar a: **Gestión → Tipos de cambio e índices**
3. Configurar tipos de cambio para las monedas necesarias (USD, EUR, etc.)

### Funcionamiento

Cuando se crea una Solicitud de Compra:
- El usuario **selecciona la moneda** del documento (MXN, USD, EUR)
- **MXN (Moneda Local)**: No se envía `DocCurrency` - SAP usa moneda local por defecto
- **USD/EUR (Monedas Extranjeras)**: Se envía `DocCurrency` y SAP aplica el tipo de cambio configurado
- SAP busca el tipo de cambio en **Gestión → Tipos de cambio e índices** para:
  - La moneda seleccionada
  - La fecha del documento (`DocDate`)
- **No es necesario** especificar manualmente `DocRate`

### Ejemplo de Request

**Para Moneda Local (MXN)**:
```json
{
  "DocDate": "2026-03-03",
  "RequiredDate": "2026-03-04",
  "DocumentLines": [...]
}
```
*Nota: No se incluye DocCurrency, SAP usa MXN por defecto*

**Para Moneda Extranjera (USD/EUR)**:
```json
{
  "DocDate": "2026-03-03",
  "DocCurrency": "USD",
  "RequiredDate": "2026-03-04",
  "DocumentLines": [...]
}
```
*Nota: SAP buscará el tipo de cambio de USD para el 03/03/2026*

### Recomendación

Para evitar errores:
- Mantener actualizados los tipos de cambio en SAP para fechas actuales y futuras
- Configurar proceso automatizado que actualice diariamente los tipos de cambio
- Opcionalmente usar `POST /CurrencyRates` de Service Layer para automatización

## Solución de Problemas (Troubleshooting)

### Error: "Specify valid tax code 'XXXXX'" (Error 400)

**Causa**: El código de impuesto ingresado no existe en SAP.

**Solución**:
1. **Opción A (Recomendada)**: Dejar el campo "Indicador de Impuestos" **vacío** - SAP usará el código de impuesto por defecto del artículo
2. **Opción B**: Ingresar el código exacto que existe en tu SAP

**Códigos Comunes en SAP México**:
- `IVAC16` - IVA 16% (Compras)
- `IVA` - IVA genérico
- `EXE` - Exento
- `IVA0` - IVA 0%

**Cómo verificar códigos válidos en SAP**:
1. Abrir una Solicitud de Compra existente en SAP Business One
2. Ver el campo "Indicador de impuestos" en las líneas
3. Usar exactamente ese código (sensible a mayúsculas/minúsculas)

O verificar en: **Administración → Definición → Finanzas → Impuestos → Indicadores de impuestos**

### Error: "Specify the required date" (Error 400)

**Causa**: Falta la fecha requerida en las líneas del documento.

**Solución**:
- Asegúrate de que el campo "Fecha Necesaria" del encabezado esté lleno
- El sistema automáticamente usará esta fecha para todas las líneas
- Cada artículo agregado debe tener una fecha requerida

**Nota**: El portal valida automáticamente que todas las líneas tengan `RequiredDate` antes de enviar.

### Error: "Update the exchange rate, 'USD'" (Error 400)

**Causa**: El tipo de cambio para la moneda no está configurado en SAP para la fecha del documento.

**Solución**:

1. Abrir **SAP Business One** (cliente de escritorio)
2. Ir a: **Gestión → Tipos de cambio e índices**
3. Seleccionar la moneda extranjera (USD, EUR, etc.)
4. Agregar el tipo de cambio para la fecha del documento
5. Guardar y volver a intentar en el portal web

### Error: Sesión expirada / Error 401

**Causa**: La sesión de SAP Service Layer ha expirado.

**Solución**: Cerrar sesión y volver a iniciar sesión en el portal.

### Error: CORS / SSL Certificate

**Causa**: El navegador está bloqueando la conexión por problemas de CORS o certificado SSL.

**Solución**: 
- Verificar que el servidor SAP Service Layer esté configurado para permitir CORS
- Aceptar el certificado SSL del servidor en el navegador
- Contactar al administrador del sistema

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
