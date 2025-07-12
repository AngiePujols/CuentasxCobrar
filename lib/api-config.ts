// API Configuration with fallback options
export const API_CONFIG = {
  // Primary endpoint (HTTPS)
  PRIMARY_BASE_URL: "https://localhost:7238/api",
  // Fallback endpoint (HTTP)
  FALLBACK_BASE_URL: "http://localhost:7238/api",
  // Development fallback (local Next.js API routes)
  DEV_BASE_URL: "/api",
  
  // Enable/disable external API
  USE_EXTERNAL_API: true,
  
  // Request timeout
  TIMEOUT: 10000,
}

// Endpoint mapping for external vs local APIs
export const ENDPOINT_MAPPING = {
  external: {
    asientosContables: "/AsientosContables",
    tiposDocumentos: "/TiposDocumentos", 
    transacciones: "/Transacciones",
    clientes: "/Clientes"
  },
  local: {
    asientosContables: "/asientos-contables",
    tiposDocumentos: "/tipos-documentos",
    transacciones: "/transacciones", 
    clientes: "/clientes"
  }
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: Check if external API should be used
    return API_CONFIG.USE_EXTERNAL_API ? API_CONFIG.PRIMARY_BASE_URL : API_CONFIG.DEV_BASE_URL
  }
  
  // Server-side: Always use external API if enabled
  return API_CONFIG.USE_EXTERNAL_API ? API_CONFIG.PRIMARY_BASE_URL : API_CONFIG.DEV_BASE_URL
}