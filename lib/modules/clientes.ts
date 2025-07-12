// Clientes API Module
const API_BASE_URL = "https://localhost:7238/api"

export interface Cliente {
  id: number
  nombre: string
  cedula: string
  limiteCredito: number
  estado: string
}

export class ClientesAPI {
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
      console.error("Clientes API request failed:", error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`No se pudo conectar al servidor en ${API_BASE_URL}. Verifique que el servidor esté ejecutándose y que las políticas CORS estén configuradas correctamente.`)
      }
      throw error
    }
  }

  static async getAll(): Promise<Cliente[]> {
    return this.request("/Clientes")
  }

  static async getById(id: number): Promise<Cliente> {
    return this.request(`/Clientes/${id}`)
  }

  static async create(data: Omit<Cliente, 'id'>): Promise<Cliente> {
    return this.request("/Clientes", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async update(id: number, data: Partial<Omit<Cliente, 'id'>>): Promise<Cliente> {
    return this.request(`/Clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  static async delete(id: number): Promise<boolean> {
    await this.request(`/Clientes/${id}`, {
      method: "DELETE",
    })
    return true
  }
}