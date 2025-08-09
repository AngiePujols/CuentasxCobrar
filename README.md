# Asiento de CxC - Módulo de Cuentas por Cobrar

Sistema completo para gestión de asientos contables de Cuentas por Cobrar desarrollado en Next.js 14 con TypeScript.

## Características

- ✅ **Next.js 14** con App Router
- ✅ **TypeScript** estricto para mayor seguridad
- ✅ **API Proxy** segura que no expone keys al cliente
- ✅ **UI Responsive** sin dependencias externas
- ✅ **Filtros por fecha** y sincronización automática
- ✅ **Validaciones** de datos y manejo de errores

## Funcionalidades Principales

### Pantalla Principal (`/asiento-cxc`)
- **Filtros de fecha**: Selección de rango "Fecha Desde" y "Fecha Hasta"
- **Tabla editable** con las columnas exactas:
  - Id. Transaccion
  - Descripcion  
  - Fecha Transacciones
  - Monto
  - Id. Asiento
  - id_Asientos (nueva columna para IDs retornados)

### Operaciones Disponibles
- **Contabilizar**: Crea entradas contables para filas con `id_Asientos === null`
- **Sincronizar**: Obtiene entradas del rango y completa `id_Asientos` por coincidencia de descripción
- **Agregar fila**: Permite añadir nuevas transacciones

## Requisitos del Sistema

- **Node.js** >= 18.0.0
- **npm** o **yarn**

## Instalación

1. **Clonar/descargar** el proyecto
2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.local.example .env.local
   ```

4. **Editar `.env.local`** con tus credenciales:
   ```env
   CXC_API_KEY=tu_api_key_aqui
   CUENTA_CXC=1101
   CUENTA_CONTRA=4101
   ```

5. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```

6. **Abrir en navegador**: http://localhost:3000/asiento-cxc

## Scripts Disponibles

```bash
npm run dev     # Ejecutar en desarrollo
npm run build   # Construir para producción  
npm run start   # Ejecutar versión de producción
npm run lint    # Verificar código con ESLint
```

## Estructura del Proyecto

```
├── app/
│   ├── api/cxc/entradas/route.ts    # API proxy interna
│   └── asiento-cxc/                 # Módulo principal
│       ├── page.tsx                 # UI React
│       └── page.module.css          # Estilos del módulo
├── lib/
│   ├── dates.ts                     # Utilidades de fechas ES ↔ ISO
│   └── ids.ts                       # Extractor de IDs
├── types/
│   └── accounting.ts                # Tipos TypeScript
├── styles/
│   └── globals.css                  # Estilos globales
├── .env.local.example               # Variables de entorno ejemplo
├── next.config.js                   # Configuración Next.js
├── package.json                     # Dependencias y scripts
└── tsconfig.json                    # Configuración TypeScript
```

## API Externa

**Base URL**: `http://3.80.223.142:3001/api/public/entradas-contables`

### Autenticación
- **Header requerido**: `x-api-key: <API_KEY>`
- **Formato**: `ak_live_xxxxxxxxxxxxx`

### Endpoints utilizados
- **GET** `/api/public/entradas-contables` - Obtener entradas
- **POST** `/api/public/entradas-contables` - Crear entrada

## Configuración de Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `CXC_API_KEY` | **Requerida**. API key para autenticación | `ak_live_xxx...` |
| `CUENTA_CXC` | Cuenta contable de CxC | `1101` |
| `CUENTA_CONTRA` | Cuenta contable contrapartida | `4101` |

## Formato de Fechas

El sistema maneja dos formatos de fecha:

- **Entrada del usuario**: `"DD de Mes"` (ej: `"03 de Julio"`)
- **API externa**: `"YYYY-MM-DD"` (formato ISO)

### Meses soportados
```typescript
enero, febrero, marzo, abril, mayo, junio,
julio, agosto, septiembre, octubre, noviembre, diciembre
```

## Seguridad

🔒 **Características de seguridad implementadas:**

- ✅ API key **NUNCA** se envía al navegador
- ✅ Rutas API internas actúan como **proxy seguro**
- ✅ Validación de entrada en servidor
- ✅ Manejo de errores sin exposición de detalles internos
- ✅ Timeouts en peticiones HTTP
- ✅ TypeScript para prevención de errores

## Comportamiento Esperado

### Flujo de Contabilización
1. Usuario llena/edita filas en la tabla
2. Presiona **"Contabilizar"**
3. Sistema procesa filas con `id_Asientos === null`
4. Para cada fila válida (`monto > 0`):
   - Convierte fecha de ES a ISO
   - Crea entrada contable con movimientos de débito/crédito
   - Actualiza `id_Asientos` con el ID retornado

### Flujo de Sincronización
1. Usuario selecciona rango de fechas
2. Presiona **"Sincronizar"**
3. Sistema obtiene entradas del rango seleccionado
4. Busca coincidencias por patrón: `"CxC Transaccion #<Id. Transaccion>"`
5. Completa `id_Asientos` en filas coincidentes

## Desarrollo y Personalización

### Ajustar cuentas contables
Modifica las variables de entorno:
```env
CUENTA_CXC=tu_cuenta_cxc
CUENTA_CONTRA=tu_cuenta_contra
```

### Agregar validaciones
Edita `app/api/cxc/entradas/route.ts` en la función POST.

### Modificar UI
Los estilos están en `app/asiento-cxc/page.module.css` y `styles/globals.css`.

## Troubleshooting

### Error: "CXC_API_KEY environment variable is required"
- Verifica que el archivo `.env.local` existe
- Confirma que la variable está correctamente definida
- Reinicia el servidor de desarrollo

### Error de conexión a la API externa
- Verifica conectividad de red
- Confirma que la API key es válida
- Revisa los logs del servidor para detalles

### Fechas no se convierten correctamente
- Usa formato exacto: `"DD de Mes"` (ej: `"03 de Julio"`)
- Los nombres de mes deben estar en español y completos
- Verifica que no hay espacios extra o caracteres especiales

## Producción

Para desplegar en producción:

1. **Variables de entorno**: Configura las variables en tu plataforma
2. **HTTPS**: Asegúrate de usar HTTPS para proteger la API key
3. **Build**: Ejecuta `npm run build` antes del despliegue
4. **Monitoring**: Considera agregar logging y monitoring adicional

---

**Desarrollado con Next.js 14 + TypeScript**  
*Sistema de Asientos de Cuentas por Cobrar v1.0*