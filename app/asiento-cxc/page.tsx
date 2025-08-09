"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Loader2, ChevronLeft, ChevronRight, FileText, DollarSign, Activity, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Transaccion {
  id: number
  tipo: string
  clienteId: number
  documento: string
  fecha: string
  categoriaId: number
  monto: number
}

interface EntradaContable {
  id: number
  descripcion: string
  auxiliar_Id: number | null
  cuenta_Id: number
  tipoMovimiento: string
  fechaAsiento: string
  montoAsiento: number
  estado_Id: number
}

interface FilaConsolidada {
  id_asiento: number | null
  clienteId: number
  descripcion: string
  auxiliar_Id: number
  auxiliar_Nombre: string
  cuenta_Id: number
  tipoMovimiento: string
  fechaAsiento: string
  montoAcumulado: number
}

const BASE_URL = 'https://localhost:7238/api'
const ENTRADAS_BASE_URL = '/api/proxy'

// Configuración: cambiar a true si el backend requiere auxiliar_Id en el POST
const INCLUDE_AUXILIAR_IN_POST = true

export default function AsientoCxCPage() {
  const [fechaDesde, setFechaDesde] = useState('2020-01-01')
  const [fechaHasta, setFechaHasta] = useState('2030-12-31')
  const [filasConsolidadas, setFilasConsolidadas] = useState<FilaConsolidada[]>([])
  const [transaccionesPendientes, setTransaccionesPendientes] = useState<FilaConsolidada[]>([])
  const [loading, setLoading] = useState(false)
  const [contabilizando, setContabilizando] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const { toast } = useToast()

  const showToast = useCallback((message: string, isError = false) => {
    toast({
      title: isError ? "❌ Error" : "✅ Éxito",
      description: message,
      variant: isError ? "destructive" : "default",
    })
  }, [toast])

  // Función para normalizar transacciones (manejar respuesta JSON o texto)
  const normalizeTransacciones = (data: any): Transaccion[] => {
    console.log("Data received in normalizeTransacciones:", data)
    console.log("Type of data:", typeof data)
    console.log("Is array?", Array.isArray(data))
    
    if (Array.isArray(data)) {
      const normalized = data.map((t: any) => ({
        id: Number(t.id) || 0,
        tipo: String(t.tipo || ''),
        clienteId: Number(t.clienteId) || 0,
        documento: String(t.documento || ''),
        fecha: String(t.fecha || ''),
        categoriaId: Number(t.categoriaId) || 0,
        monto: Number(t.monto) || 0
      }))
      console.log("Normalized transactions:", normalized)
      return normalized
    }
    
    // Si no es array, intentar parsearlo como texto o devolver array vacío
    console.warn("Data is not an array, returning empty array")
    return []
  }

  // Función para agrupar por cliente
  const groupByCliente = (transacciones: Transaccion[]) => {
    console.log("=== INICIANDO AGRUPACION POR CLIENTE ===")
    console.log("Transacciones a agrupar:", transacciones)
    
    const grupos: Record<number, { total: number; fechaMax: Date }> = {}
    
    for (const trans of transacciones) {
      const clienteId = trans.clienteId
      const monto = Number(trans.monto || 0)
      const fecha = new Date(trans.fecha)
      
      console.log(`Procesando transacción ID ${trans.id}:`, {
        clienteId,
        monto,
        fecha: trans.fecha,
        fechaParsed: fecha
      })
      
      if (!grupos[clienteId]) {
        grupos[clienteId] = { total: 0, fechaMax: new Date(0) }
        console.log(`Creando nuevo grupo para cliente ${clienteId}`)
      }
      
      grupos[clienteId].total += monto
      if (fecha > grupos[clienteId].fechaMax) {
        grupos[clienteId].fechaMax = fecha
      }
      
      console.log(`Grupo cliente ${clienteId} actualizado:`, grupos[clienteId])
    }
    
    console.log("=== GRUPOS FINALES ===", grupos)
    return grupos
  }

  // Función para formatear fecha a YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // Función para normalizar texto para comparación
  const normalize = (text: string): string => {
    return text.toLowerCase().trim()
  }

  // Función para obtener entradas contables del backend
  async function obtenerEntradasContables(fechaInicio: string, fechaFin: string) {
    const qs = new URLSearchParams({
      fechaInicio, // "YYYY-MM-DD"
      fechaFin,    // "YYYY-MM-DD"
      cuenta_Id: "8"
    }).toString()

    console.log(`Fetching entradas: ${ENTRADAS_BASE_URL}/entradas-contables?${qs}`)
    
    const res = await fetch(`${ENTRADAS_BASE_URL}/entradas-contables?${qs}`, {
      headers: {
        'X-API-Key': 'ak_live_e030145cab28d2cf2623fdc8bc9f2fb6ba0038253704b703',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors'
    })
    
    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`GET /entradas falló: ${res.status} ${errText}`)
    }
    
    const json = await res.json()
    console.log("Respuesta GET entradas:", json)
    
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error("Respuesta inesperada del GET de entradas")
    }
    
    // Mapear a lo que usa la UI - CORREGIDO: usar e.id no e.id_asiento
    return json.data.map((e: any) => ({
      id: e.id,  // Este es el id real de la entrada
      descripcion: e.descripcion,
      auxiliar_Id: e.auxiliar_Id,
      cuenta_Id: e.cuenta_Id,
      tipoMovimiento: e.tipoMovimiento,
      fechaAsiento: e.fechaAsiento,
      montoAsiento: e.montoAsiento,
      estado_Id: e.estado_Id
    }))
  }

  // Función para crear entrada contable en el backend
  async function crearEntradaContable(input: any) {
    const body: any = {
      descripcion: input.descripcion,
      cuenta_Id: 8,
      tipoMovimiento: "CR",
      fechaAsiento: input.fechaAsiento, // "YYYY-MM-DD"
      montoAsiento: Number(input.montoAsiento)
    }

    // Solo incluir auxiliar_Id si está configurado
    if (INCLUDE_AUXILIAR_IN_POST) {
      body.auxiliar_Id = 7
    }

    console.log("POST payload:", body)

    const res = await fetch(`${ENTRADAS_BASE_URL}/entradas-contables`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'X-API-Key': 'ak_live_e030145cab28d2cf2623fdc8bc9f2fb6ba0038253704b703'
      },
      mode: 'cors',
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`POST /entradas falló: ${res.status} ${errText}`)
    }

    // Aunque el POST devuelva un objeto, el id_asiento en UI
    // se llenará únicamente con el GET de entradas contables.
    return res.json().catch(() => ({}))
  }

  // Función para mapear id_asiento desde entradas existentes
  async function mapearIdAsientos(filas: FilaConsolidada[]) {
    try {
      const entradas = await obtenerEntradasContables(fechaDesde, fechaHasta)
      console.log("=== MAPEANDO ID_ASIENTOS ===")
      console.log("Entradas contables obtenidas:", entradas)
      console.log("Filas a mapear:", filas)

      // Mapear id_asiento desde entradas existentes
      filas.forEach(fila => {
        console.log(`\nBuscando entrada para fila cliente ${fila.clienteId}:`)
        console.log("- Descripción fila:", fila.descripcion)
        console.log("- Monto fila:", fila.montoAcumulado)
        
        // NUEVA ESTRATEGIA: Buscar por monto y fecha, ya que descripción puede variar
        const entradaExistente = entradas.find((entrada: any) => {
          const matchCuenta = entrada.cuenta_Id === 8
          const matchTipo = entrada.tipoMovimiento === "CR" 
          const matchMonto = Math.abs(Number(entrada.montoAsiento) - Number(fila.montoAcumulado)) < 0.01
          const matchFecha = entrada.fechaAsiento === fila.fechaAsiento
          
          console.log(`  Comparando con entrada ID ${entrada.id}:`)
          console.log(`    - Cuenta ${entrada.cuenta_Id} === 8? ${matchCuenta}`)
          console.log(`    - Tipo '${entrada.tipoMovimiento}' === 'CR'? ${matchTipo}`)
          console.log(`    - Monto ${entrada.montoAsiento} ~= ${fila.montoAcumulado}? ${matchMonto}`)
          console.log(`    - Fecha '${entrada.fechaAsiento}' === '${fila.fechaAsiento}'? ${matchFecha}`)
          console.log(`    - Descripción entrada: '${entrada.descripcion}'`)
          
          return matchCuenta && matchTipo && matchMonto && matchFecha
        })
        
        if (entradaExistente) {
          fila.id_asiento = entradaExistente.id  // Usar entrada.id no entrada.id_asiento
          console.log(`✅ Mapeado id_asiento ${entradaExistente.id} para cliente ${fila.clienteId}`)
        } else {
          console.log(`❌ No se encontró entrada para cliente ${fila.clienteId}`)
        }
      })
      
      console.log("=== FIN MAPEO ===")
    } catch (error) {
      console.error("Error mapeando id_asientos:", error)
      // No lanzar error, solo log - las filas quedarán sin id_asiento
    }
  }

  // Cargar datos con persistencia y detección de cambios
  const loadData = async () => {
    try {
      setLoading(true)
      
      console.log("=== CARGANDO DATOS CON PERSISTENCIA ===")
      
      // 1. GET entradas contables existentes (siempre se muestran)
      const entradas = await obtenerEntradasContables(fechaDesde, fechaHasta)
      console.log("Entradas contables existentes:", entradas)
      
      // 2. GET transacciones para detectar cambios
      let transaccionesCambiadas: FilaConsolidada[] = []
      
      try {
        console.log("Verificando transacciones...")
        const transResponse = await fetch(`${BASE_URL}/Transacciones`, {
          headers: {
            'X-API-Key': 'ak_live_e030145cab28d2cf2623fdc8bc9f2fb6ba0038253704b703',
            'Content-Type': 'application/json',
          },
        })
        
        if (transResponse.ok) {
          const transData = await transResponse.json()
          let dataToNormalize = transData.data || transData.items || transData || []
          const transacciones = normalizeTransacciones(dataToNormalize)
          
          console.log("Transacciones actuales:", transacciones)
          
          if (transacciones.length > 0) {
            // Agrupar transacciones por cliente
            const grupos = groupByCliente(transacciones)
            
            // Para cada grupo, verificar si ya existe una entrada con esos datos
            transaccionesCambiadas = Object.entries(grupos)
              .map(([clienteIdStr, grupo]) => {
                const clienteId = Number(clienteIdStr)
                const fechaAsiento = formatDate(grupo.fechaMax)
                const montoAcumulado = Math.round(grupo.total * 100) / 100
                
                // Buscar si ya existe una entrada contable que coincida exactamente
                const entradaExistente = entradas.find((entrada: any) => {
                  const matchCuenta = entrada.cuenta_Id === 8
                  const matchTipo = entrada.tipoMovimiento === "CR"
                  const matchMonto = Math.abs(Number(entrada.montoAsiento) - montoAcumulado) < 0.01
                  const matchFecha = entrada.fechaAsiento === fechaAsiento
                  const matchDescripcion = entrada.descripcion?.includes(`cliente ${clienteId}`)
                  
                  return matchCuenta && matchTipo && matchMonto && matchFecha && matchDescripcion
                })
                
                if (entradaExistente) {
                  console.log(`✅ Cliente ${clienteId}: Ya contabilizado (ID: ${entradaExistente.id})`)
                  return null // Ya está contabilizado, no agregar
                } else {
                  console.log(`⚠️ Cliente ${clienteId}: Cambio detectado - requiere contabilización`)
                  return {
                    id_asiento: null, // Pendiente de contabilizar
                    clienteId,
                    descripcion: `Consolidado CxC cliente ${clienteId}`,
                    auxiliar_Id: 7,
                    auxiliar_Nombre: "COMPRAS",
                    cuenta_Id: 8,
                    tipoMovimiento: "CR",
                    fechaAsiento,
                    montoAcumulado
                  }
                }
              })
              .filter(Boolean) as FilaConsolidada[] // Filtrar nulls
          }
        }
      } catch (transError) {
        console.warn("No se pudieron cargar transacciones:", transError)
      }
      
      console.log("Transacciones que requieren contabilización:", transaccionesCambiadas)
      
      // 3. SIEMPRE mostrar las entradas contabilizadas + agregar pendientes si hay cambios
      const filasFromEntradas: FilaConsolidada[] = entradas.map((entrada: any, index: number) => {
        // Extraer clienteId de la descripción si es posible
        let clienteId = index + 1
        const match = entrada.descripcion?.match(/cliente (\d+)/i)
        if (match) {
          clienteId = Number(match[1])
        }
        
        return {
          id_asiento: entrada.id, // Ya contabilizada
          clienteId: clienteId,
          descripcion: entrada.descripcion || `Entrada ${entrada.id}`,
          auxiliar_Id: entrada.auxiliar_Id || 7,
          auxiliar_Nombre: "COMPRAS",
          cuenta_Id: entrada.cuenta_Id || 8,
          tipoMovimiento: entrada.tipoMovimiento || "CR",
          fechaAsiento: entrada.fechaAsiento,
          montoAcumulado: Number(entrada.montoAsiento) || 0
        }
      })
      
      // Combinar entradas existentes + transacciones cambiadas
      const todasLasFilas = [...filasFromEntradas, ...transaccionesCambiadas]
      
      console.log("=== DATOS FINALES ===")
      console.log("Entradas contabilizadas:", filasFromEntradas.length)
      console.log("Transacciones pendientes:", transaccionesCambiadas.length)
      console.log("Total filas en tabla:", todasLasFilas.length)
      
      setFilasConsolidadas(todasLasFilas)
      setTransaccionesPendientes(transaccionesCambiadas)
      
    } catch (error) {
      console.error("Error loading data:", error)
      showToast("No se pudieron cargar los datos.", true)
      setFilasConsolidadas([])
      setTransaccionesPendientes([])
    } finally {
      setLoading(false)
    }
  }

  // Función para actualizar id_asiento de las filas actuales
  const actualizarIdAsientos = async () => {
    try {
      console.log("=== ACTUALIZANDO ID_ASIENTOS ===")
      
      // Obtener las entradas más recientes
      const entradas = await obtenerEntradasContables(fechaDesde, fechaHasta)
      console.log("Entradas obtenidas para mapeo:", entradas)
      
      // Actualizar las filas actuales con los id_asiento
      const filasActualizadas = filasConsolidadas.map(fila => {
        if (fila.id_asiento) {
          // Si ya tiene id_asiento, no cambiar nada
          return fila
        }
        
        // Buscar la entrada correspondiente
        const entradaCorrespondiente = entradas.find((entrada: any) => {
          const matchCuenta = entrada.cuenta_Id === 8
          const matchTipo = entrada.tipoMovimiento === "CR"
          const matchMonto = Math.abs(Number(entrada.montoAsiento) - Number(fila.montoAcumulado)) < 0.01
          const matchFecha = entrada.fechaAsiento === fila.fechaAsiento
          
          console.log(`Comparando fila cliente ${fila.clienteId} con entrada ${entrada.id}:`, {
            matchCuenta, matchTipo, matchMonto, matchFecha,
            entradaMonto: entrada.montoAsiento,
            filaMonto: fila.montoAcumulado,
            entradaFecha: entrada.fechaAsiento,
            filaFecha: fila.fechaAsiento
          })
          
          return matchCuenta && matchTipo && matchMonto && matchFecha
        })
        
        if (entradaCorrespondiente) {
          console.log(`✅ Asignando id_asiento ${entradaCorrespondiente.id} a cliente ${fila.clienteId}`)
          return {
            ...fila,
            id_asiento: entradaCorrespondiente.id
          }
        }
        
        console.log(`❌ No se encontró entrada para cliente ${fila.clienteId}`)
        return fila
      })
      
      console.log("Filas actualizadas:", filasActualizadas)
      setFilasConsolidadas(filasActualizadas)
      
      // Actualizar transacciones pendientes (filtrar las que ya tienen id_asiento)
      const nuevasPendientes = filasActualizadas.filter(f => !f.id_asiento)
      setTransaccionesPendientes(nuevasPendientes)
      
    } catch (error) {
      console.error("Error actualizando id_asientos:", error)
    }
  }

  // Función para contabilizar transacciones pendientes
  const contabilizar = async () => {
    try {
      setContabilizando(true)
      
      if (transaccionesPendientes.length === 0) {
        showToast("No hay transacciones pendientes para contabilizar.", true)
        return
      }
      
      console.log(`Contabilizando ${transaccionesPendientes.length} transacciones pendientes`)
      
      // Crear entradas contables para cada transacción pendiente
      const results = await Promise.allSettled(
        transaccionesPendientes.map(fila => 
          crearEntradaContable({
            descripcion: fila.descripcion,
            fechaAsiento: fila.fechaAsiento,
            montoAsiento: fila.montoAcumulado
          })
        )
      )
      
      // Contar éxitos y errores
      let successCount = 0
      let errorCount = 0
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++
          console.log(`Transacción ${index + 1} contabilizada:`, result.value)
        } else {
          errorCount++
          console.error(`Error en transacción ${index + 1}:`, result.reason)
        }
      })
      
      // Mostrar resultado
      if (successCount > 0 && errorCount === 0) {
        showToast(`${successCount} transacciones contabilizadas exitosamente.`)
      } else if (successCount > 0 && errorCount > 0) {
        showToast(`${successCount} exitosas, ${errorCount} con errores.`, true)
      } else {
        showToast('Error contabilizando todas las transacciones.', true)
      }
      
      // Esperar un momento y recargar todo para ver la nueva estructura
      console.log("Esperando 1 segundo antes de recargar...")
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Recargar datos completos para mostrar todo con persistencia
      console.log("Recargando datos completos...")
      await loadData()
      
    } catch (error) {
      console.error("Error contabilizando:", error)
      showToast("Error durante la contabilización.", true)
    } finally {
      setContabilizando(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData()
  }, [])

  // Calcular datos paginados
  const totalPages = Math.ceil(filasConsolidadas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedFilas = filasConsolidadas.slice(startIndex, endIndex)

  // Funciones de navegación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  const handleSearch = () => {
    setCurrentPage(1)
    loadData()
  }

  // Calcular estadísticas
  const totalMonto = filasConsolidadas.reduce((sum, f) => sum + f.montoAcumulado, 0)
  const totalContabilizadas = filasConsolidadas.filter(f => f.id_asiento !== null).length
  const totalPendientes = transaccionesPendientes.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-slate-600">Cargando entradas contables...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Entradas Contables
                </h1>
                <p className="text-slate-600 text-lg">Consolidación de transacciones por cliente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Monto</p>
                  <p className="text-2xl font-bold text-green-700">${totalMonto.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Contabilizadas</p>
                  <p className="text-2xl font-bold text-blue-700">{totalContabilizadas}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Pendientes</p>
                  <p className="text-2xl font-bold text-orange-700">{totalPendientes}</p>
                </div>
                <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Clientes</p>
                  <p className="text-2xl font-bold text-purple-700">{filasConsolidadas.length}</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Filtros de búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fechaDesde" className="text-sm font-medium text-slate-700">
                  Fecha Desde
                </Label>
                <Input
                  id="fechaDesde"
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="bg-white border-2 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaHasta" className="text-sm font-medium text-slate-700">
                  Fecha Hasta
                </Label>
                <Input
                  id="fechaHasta"
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="bg-white border-2 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón Contabilizar */}
        <div className="flex justify-between items-center">
          <div></div>
          <Button 
            onClick={contabilizar}
            disabled={contabilizando || transaccionesPendientes.length === 0}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {contabilizando ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Contabilizando...
              </>
            ) : (
              "Contabilizar"
            )}
          </Button>
        </div>

        {/* Tabla Consolidada */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <TableHead className="font-semibold text-slate-700 min-w-[100px]">ID Asiento</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[100px]">Cliente ID</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[200px]">Descripción</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">Auxiliar</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[100px]">Cuenta ID</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">Tipo Mov.</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">Fecha</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 min-w-[140px]">Monto Acumulado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFilas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No se encontraron entradas consolidadas
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedFilas.map((fila, index) => (
                      <TableRow
                        key={`${fila.clienteId}-${index}`}
                        className={`hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? "bg-white/30" : "bg-slate-50/30"}`}
                      >
                        <TableCell>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            fila.id_asiento 
                              ? "bg-green-100 text-green-700 border border-green-200" 
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}>
                            {fila.id_asiento || 'Pendiente'}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{fila.clienteId}</TableCell>
                        <TableCell className="font-medium">{fila.descripcion}</TableCell>
                        <TableCell>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {fila.auxiliar_Id} - {fila.auxiliar_Nombre}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {fila.cuenta_Id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {fila.tipoMovimiento}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{fila.fechaAsiento}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          ${fila.montoAcumulado.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Paginación */}
        {filasConsolidadas.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filasConsolidadas.length)} de {filasConsolidadas.length} resultados
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="bg-white/50 border-slate-200 hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className={
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                              : "bg-white/50 border-slate-200 hover:bg-slate-50"
                          }
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="bg-white/50 border-slate-200 hover:bg-slate-50"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}