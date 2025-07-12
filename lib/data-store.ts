export interface Cliente {
  id: number
  nombre: string
  cedula: string
  limiteCredito: number
  estado: string
}

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

export interface TipoDocumento {
  id: number
  nombre: string
  descripcion: string
  prefijo: string
  siguienteNumero: number
  activo: boolean
  fechaCreacion: string
}

export interface Transaccion {
  id: number
  asientoContableId: number
  cuentaContable: string
  descripcion: string
  debito: number
  credito: number
  fechaCreacion: string
}

// In-memory data store for demo purposes
// In a real application, this would be replaced with a database
class DataStore {
  private tiposDocumentos: TipoDocumento[] = []

  private asientosContables: AsientoContable[] = []

  private transacciones: Transaccion[] = []

  private clientes: Cliente[] = []

  private nextClienteId: number = 1
  private nextAsientoId: number = 1
  private nextTipoDocId: number = 1
  private nextTransaccionId: number = 1

  getClientes(): Cliente[] {
    return this.clientes
  }

  getCliente(id: number): Cliente | undefined {
    return this.clientes.find(c => c.id === id)
  }

  createCliente(clienteData: Omit<Cliente, 'id' | 'fechaRegistro'>): Cliente {
    const newCliente: Cliente = {
      id: this.nextClienteId++,
      fechaRegistro: new Date().toISOString(),
      ...clienteData
    }
    this.clientes.push(newCliente)
    return newCliente
  }

  updateCliente(id: number, clienteData: Partial<Omit<Cliente, 'id' | 'fechaRegistro'>>): Cliente | null {
    const index = this.clientes.findIndex(c => c.id === id)
    if (index === -1) return null

    this.clientes[index] = {
      ...this.clientes[index],
      ...clienteData
    }
    return this.clientes[index]
  }

  deleteCliente(id: number): boolean {
    const index = this.clientes.findIndex(c => c.id === id)
    if (index === -1) return false

    this.clientes.splice(index, 1)
    return true
  }

  // Tipos de Documentos methods
  getTiposDocumentos(): TipoDocumento[] {
    return this.tiposDocumentos
  }

  getTipoDocumento(id: number): TipoDocumento | undefined {
    return this.tiposDocumentos.find(t => t.id === id)
  }

  createTipoDocumento(tipoData: Omit<TipoDocumento, 'id' | 'fechaCreacion'>): TipoDocumento {
    const newTipo: TipoDocumento = {
      id: this.nextTipoDocId++,
      fechaCreacion: new Date().toISOString(),
      ...tipoData
    }
    this.tiposDocumentos.push(newTipo)
    return newTipo
  }

  updateTipoDocumento(id: number, tipoData: Partial<Omit<TipoDocumento, 'id' | 'fechaCreacion'>>): TipoDocumento | null {
    const index = this.tiposDocumentos.findIndex(t => t.id === id)
    if (index === -1) return null

    this.tiposDocumentos[index] = {
      ...this.tiposDocumentos[index],
      ...tipoData
    }
    return this.tiposDocumentos[index]
  }

  deleteTipoDocumento(id: number): boolean {
    const index = this.tiposDocumentos.findIndex(t => t.id === id)
    if (index === -1) return false

    this.tiposDocumentos.splice(index, 1)
    return true
  }

  // Asientos Contables methods
  getAsientosContables(): AsientoContable[] {
    return this.asientosContables
  }

  getAsientoContable(id: number): AsientoContable | undefined {
    return this.asientosContables.find(a => a.id === id)
  }

  createAsientoContable(asientoData: Omit<AsientoContable, 'id' | 'fechaCreacion'>): AsientoContable {
    const newAsiento: AsientoContable = {
      id: this.nextAsientoId++,
      fechaCreacion: new Date().toISOString(),
      ...asientoData
    }
    this.asientosContables.push(newAsiento)
    return newAsiento
  }

  updateAsientoContable(id: number, asientoData: Partial<Omit<AsientoContable, 'id' | 'fechaCreacion'>>): AsientoContable | null {
    const index = this.asientosContables.findIndex(a => a.id === id)
    if (index === -1) return null

    this.asientosContables[index] = {
      ...this.asientosContables[index],
      ...asientoData
    }
    return this.asientosContables[index]
  }

  deleteAsientoContable(id: number): boolean {
    const index = this.asientosContables.findIndex(a => a.id === id)
    if (index === -1) return false

    this.asientosContables.splice(index, 1)
    return true
  }

  // Transacciones methods
  getTransacciones(): Transaccion[] {
    return this.transacciones
  }

  getTransaccion(id: number): Transaccion | undefined {
    return this.transacciones.find(t => t.id === id)
  }

  getTransaccionesByAsiento(asientoId: number): Transaccion[] {
    return this.transacciones.filter(t => t.asientoContableId === asientoId)
  }

  createTransaccion(transaccionData: Omit<Transaccion, 'id' | 'fechaCreacion'>): Transaccion {
    const newTransaccion: Transaccion = {
      id: this.nextTransaccionId++,
      fechaCreacion: new Date().toISOString(),
      ...transaccionData
    }
    this.transacciones.push(newTransaccion)
    return newTransaccion
  }

  updateTransaccion(id: number, transaccionData: Partial<Omit<Transaccion, 'id' | 'fechaCreacion'>>): Transaccion | null {
    const index = this.transacciones.findIndex(t => t.id === id)
    if (index === -1) return null

    this.transacciones[index] = {
      ...this.transacciones[index],
      ...transaccionData
    }
    return this.transacciones[index]
  }

  deleteTransaccion(id: number): boolean {
    const index = this.transacciones.findIndex(t => t.id === id)
    if (index === -1) return false

    this.transacciones.splice(index, 1)
    return true
  }
}

// Export a singleton instance
export const dataStore = new DataStore()