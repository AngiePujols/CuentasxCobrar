// AsientosContables API Module
const API_BASE_URL = "https://localhost:7238/api"

export interface AsientoContable {
  id: number
  fecha: string
  numeroComprobante: string
  concepto: string
  tipoDocumentoId: number
  clienteId?: number
  totalDebito: number
  totalCredito: number
  estado: string
  fechaCreacion: string
}

export class AsientosContablesAPI {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return await response.text()
      }
    } catch (error) {
      console.error("AsientosContables API request failed:", error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`No se pudo conectar al servidor en ${API_BASE_URL}. Verifique que el servidor esté ejecutándose y que las políticas CORS estén configuradas correctamente.`)
      }
      throw error
    }
  }

  static async getAll(): Promise<AsientoContable[]> {
    return this.request("/AsientosContables")
  }

  static async getById(id: number): Promise<AsientoContable> {
    return this.request(`/AsientosContables/${id}`)
  }

  static async create(data: Omit<AsientoContable, 'id' | 'fechaCreacion'>): Promise<AsientoContable> {
    return this.request("/AsientosContables", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async update(id: number, data: Partial<Omit<AsientoContable, 'id' | 'fechaCreacion'>>): Promise<AsientoContable> {
    return this.request(`/AsientosContables/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  static async delete(id: number): Promise<boolean> {
    await this.request(`/AsientosContables/${id}`, {
      method: "DELETE",
    })
    return true
  }
}