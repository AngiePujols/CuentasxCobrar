"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CreditCard,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiService } from "@/lib/api"

interface Transaccion {
  id: number
  tipoMovimiento: string
  tiposDocumentoId: number
  nombreTipoDocumento?: string
  numeroDocumento: string
  fecha: string
  clienteId: number
  nombreCliente?: string
  monto: number
}

interface TipoDocumento {
  id: number
  nombre: string
  estado: boolean
}

interface Cliente {
  id: number
  nombre: string
  cedula: string
  limiteCredito: number
  estado: boolean
}

export default function TransaccionesPage() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [filteredTransacciones, setFilteredTransacciones] = useState<Transaccion[]>([])
  const [tiposDocumentos, setTiposDocumentos] = useState<TipoDocumento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editingTransaccion, setEditingTransaccion] = useState<Transaccion | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [tipoMovimientoFilter, setTipoMovimientoFilter] = useState("todos")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [createForm, setCreateForm] = useState({
    tiposDocumentoId: "",
    numeroDocumento: "",
    fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    clienteId: "",
    monto: "",
  })
  const [editForm, setEditForm] = useState({
    tiposDocumentoId: "",
    numeroDocumento: "",
    fecha: "",
    clienteId: "",
    monto: "",
  })
  const { toast } = useToast()

  // Funciones para formatear monto
  const formatCurrency = (value: string) => {
    // Remover caracteres no numéricos excepto punto decimal
    const numbers = value.replace(/[^\d.]/g, '')
    const num = parseFloat(numbers) || 0
    return num.toLocaleString('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const parseCurrency = (value: string) => {
    return value.replace(/[^\d.]/g, '')
  }

  const handleMontoChange = (value: string, isEdit: boolean = false) => {
    // Solo permitir números positivos
    const cleanValue = value.replace(/[^\d.]/g, '')
    const numericValue = parseFloat(cleanValue) || 0
    
    if (numericValue < 0) return // No permitir valores negativos
    
    if (isEdit) {
      setEditForm({ ...editForm, monto: cleanValue })
    } else {
      setCreateForm({ ...createForm, monto: cleanValue })
    }
  }

  // Cargar datos desde la API
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    await Promise.all([
      loadTransacciones(),
      loadTiposDocumentos(),
      loadClientes()
    ])
  }

  const loadTiposDocumentos = async () => {
    try {
      console.log("=== CARGANDO TIPOS DOCUMENTOS ===")
      const data = await ApiService.getTiposDocumentos()
      console.log("Raw data tipos documentos:", data)
      console.log("Type of data:", typeof data)
      console.log("Is array?", Array.isArray(data))
      
      // Intentar diferentes estructuras de respuesta
      let processedData = data
      if (data && data.data) {
        processedData = data.data
        console.log("Using data.data:", processedData)
      } else if (data && data.items) {
        processedData = data.items
        console.log("Using data.items:", processedData)
      }
      
      const finalData = Array.isArray(processedData) ? processedData : []
      console.log("Final tipos documentos data:", finalData)
      console.log("Count:", finalData.length)
      
      setTiposDocumentos(finalData)
    } catch (error) {
      console.error("Error loading tipos documentos:", error)
      toast({
        title: "⚠️ Advertencia",
        description: "No se pudieron cargar los tipos de documentos.",
        variant: "destructive",
      })
      setTiposDocumentos([])
    }
  }

  const loadClientes = async () => {
    try {
      console.log("=== CARGANDO CLIENTES ===")
      const data = await ApiService.getClientes()
      console.log("Raw data clientes:", data)
      console.log("Type of data:", typeof data)
      console.log("Is array?", Array.isArray(data))
      
      // Intentar diferentes estructuras de respuesta
      let processedData = data
      if (data && data.data) {
        processedData = data.data
        console.log("Using data.data:", processedData)
      } else if (data && data.items) {
        processedData = data.items
        console.log("Using data.items:", processedData)
      }
      
      const finalData = Array.isArray(processedData) ? processedData : []
      console.log("Final clientes data:", finalData)
      console.log("Count:", finalData.length)
      
      setClientes(finalData)
    } catch (error) {
      console.error("Error loading clientes:", error)
      toast({
        title: "⚠️ Advertencia",
        description: "No se pudieron cargar los clientes.",
        variant: "destructive",
      })
      setClientes([])
    }
  }

  const loadTransacciones = async () => {
    try {
      setLoading(true)
      const data = await ApiService.getTransacciones()
      setTransacciones(data)
      setFilteredTransacciones(data)
    } catch (error) {
      console.error("Error loading transacciones:", error)
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar las transacciones.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar transacciones
  useEffect(() => {
    let filtered = transacciones.filter(
      (transaccion) =>
        (transaccion?.numeroDocumento?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (transaccion?.nombreCliente?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (transaccion?.nombreTipoDocumento?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
    )

    if (dateFrom) {
      filtered = filtered.filter((transaccion) => (transaccion.fecha || "") >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((transaccion) => (transaccion.fecha || "") <= dateTo)
    }

    if (tipoMovimientoFilter && tipoMovimientoFilter !== "todos") {
      filtered = filtered.filter((transaccion) => transaccion.tipoMovimiento === tipoMovimientoFilter)
    }

    setFilteredTransacciones(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [transacciones, searchTerm, dateFrom, dateTo, tipoMovimientoFilter])

  // Calcular datos paginados
  const totalPages = Math.ceil(filteredTransacciones.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransacciones = filteredTransacciones.slice(startIndex, endIndex)

  // Funciones de navegación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  // Funciones para limpiar formularios
  const resetCreateForm = () => {
    setCreateForm({
      tiposDocumentoId: "",
      numeroDocumento: "",
      fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
      clienteId: "",
      monto: "",
    })
  }

  const resetEditForm = () => {
    setEditForm({
      tiposDocumentoId: "",
      numeroDocumento: "",
      fecha: "",
      clienteId: "",
      monto: "",
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (
      !createForm.tiposDocumentoId.trim() ||
      !createForm.numeroDocumento.trim() ||
      !createForm.fecha.trim() ||
      !createForm.clienteId.trim() ||
      !createForm.monto.trim()
    ) {
      toast({
        title: "❌ Error de validación",
        description: "Todos los campos son requeridos.",
        variant: "destructive",
      })
      return
    }

    // Validación de números
    if (isNaN(Number(createForm.tiposDocumentoId)) || Number(createForm.tiposDocumentoId) <= 0) {
      toast({
        title: "❌ Error de validación",
        description: "Debe seleccionar un tipo de documento válido.",
        variant: "destructive",
      })
      return
    }

    if (isNaN(Number(createForm.clienteId)) || Number(createForm.clienteId) <= 0) {
      toast({
        title: "❌ Error de validación",
        description: "Debe seleccionar un cliente válido.",
        variant: "destructive",
      })
      return
    }

    const montoValue = parseCurrency(createForm.monto)
    if (isNaN(Number(montoValue)) || Number(montoValue) <= 0) {
      toast({
        title: "❌ Error de validación",
        description: "El monto debe ser un número válido mayor a 0.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const newTransaccion = {
        id: 0, // Se autogenera en el backend
        tipoMovimiento: "Credito", // Valor fijo por defecto
        tiposDocumentoId: Number.parseInt(createForm.tiposDocumentoId),
        nombreTipoDocumento: "", // Se llena automáticamente en el backend
        numeroDocumento: createForm.numeroDocumento.trim(),
        fecha: new Date(createForm.fecha + 'T12:00:00.000Z').toISOString(),
        clienteId: Number.parseInt(createForm.clienteId),
        nombreCliente: "", // Se llena automáticamente en el backend
        monto: Number.parseFloat(parseCurrency(createForm.monto)),
      }

      console.log("Datos a enviar:", newTransaccion)

      await ApiService.createTransaccion(newTransaccion)
      await loadTransacciones() // Recargar datos
      setIsCreateOpen(false)
      resetCreateForm() // Limpiar formulario
      toast({
        title: "✨ Transacción creada",
        description: "La transacción se ha creado exitosamente.",
      })
    } catch (error) {
      console.error("Error creating transaccion:", error)
      let errorMessage = "No se pudo crear la transacción."
      
      if (error instanceof Error) {
        if (error.message.includes("404")) {
          errorMessage = "Cliente o Tipo de Documento no encontrado. Verifique los IDs."
        } else if (error.message.includes("400")) {
          errorMessage = "Datos inválidos. Verifique todos los campos."
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "No se pudo conectar al servidor. Verifique la conexión."
        }
      }
      
      toast({
        title: "❌ Error al crear",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransaccion) return

    // Validación básica
    if (
      !editForm.tiposDocumentoId.trim() ||
      !editForm.numeroDocumento.trim() ||
      !editForm.fecha.trim() ||
      !editForm.clienteId.trim() ||
      !editForm.monto.trim()
    ) {
      toast({
        title: "❌ Error de validación",
        description: "Todos los campos son requeridos.",
        variant: "destructive",
      })
      return
    }

    // Validación de números
    if (isNaN(Number(editForm.tiposDocumentoId)) || Number(editForm.tiposDocumentoId) <= 0) {
      toast({
        title: "❌ Error de validación",
        description: "Debe seleccionar un tipo de documento válido.",
        variant: "destructive",
      })
      return
    }

    if (isNaN(Number(editForm.clienteId)) || Number(editForm.clienteId) <= 0) {
      toast({
        title: "❌ Error de validación",
        description: "Debe seleccionar un cliente válido.",
        variant: "destructive",
      })
      return
    }

    const montoValue = parseCurrency(editForm.monto)
    if (isNaN(Number(montoValue)) || Number(montoValue) <= 0) {
      toast({
        title: "❌ Error de validación",
        description: "El monto debe ser un número válido mayor a 0.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const updatedTransaccion = {
        id: editingTransaccion.id,
        tipoMovimiento: "Credito", // Valor fijo por defecto
        tiposDocumentoId: Number.parseInt(editForm.tiposDocumentoId),
        nombreTipoDocumento: editingTransaccion.nombreTipoDocumento || "", // Mantener el valor existente
        numeroDocumento: editForm.numeroDocumento.trim(),
        fecha: new Date(editForm.fecha + 'T12:00:00.000Z').toISOString(),
        clienteId: Number.parseInt(editForm.clienteId),
        nombreCliente: editingTransaccion.nombreCliente || "", // Mantener el valor existente
        monto: Number.parseFloat(parseCurrency(editForm.monto)),
      }

      console.log("Datos a actualizar:", updatedTransaccion)

      await ApiService.updateTransaccion(editingTransaccion.id, updatedTransaccion)
      await loadTransacciones() // Recargar datos
      setIsEditOpen(false)
      setEditingTransaccion(null)
      resetEditForm()
      toast({
        title: "🎉 Transacción actualizada",
        description: "La transacción se ha actualizado exitosamente.",
      })
    } catch (error) {
      console.error("Error updating transaccion:", error)
      let errorMessage = "No se pudo actualizar la transacción."
      
      if (error instanceof Error) {
        if (error.message.includes("404")) {
          errorMessage = "Transacción, Cliente o Tipo de Documento no encontrado."
        } else if (error.message.includes("400")) {
          errorMessage = "Datos inválidos. Verifique todos los campos."
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "No se pudo conectar al servidor. Verifique la conexión."
        }
      }
      
      toast({
        title: "❌ Error al actualizar",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setSubmitting(true)
      await ApiService.deleteTransaccion(deleteId)
      await loadTransacciones() // Recargar datos
      setDeleteId(null)
      toast({
        title: "🗑️ Transacción eliminada",
        description: "La transacción se ha eliminado exitosamente.",
      })
    } catch (error) {
      console.error("Error deleting transaccion:", error)
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar la transacción.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (transaccion: Transaccion) => {
    setEditingTransaccion(transaccion)
    setEditForm({
      tiposDocumentoId: transaccion.tiposDocumentoId?.toString() || "",
      numeroDocumento: transaccion.numeroDocumento || "",
      fecha: transaccion.fecha ? new Date(transaccion.fecha).toISOString().split('T')[0] : "",
      clienteId: transaccion.clienteId?.toString() || "",
      monto: transaccion.monto?.toString() || "",
    })
    setIsEditOpen(true)
  }

  // Calcular estadísticas
  const totalMonto = transacciones.reduce((sum, t) => sum + (t.monto || 0), 0)
  const transaccionesVenta = transacciones.filter(t => t.tipoMovimiento === "Venta").length
  const transaccionesPago = transacciones.filter(t => t.tipoMovimiento === "Pago").length
  const totalTransacciones = transacciones.length

  // Removed unused color and icon functions

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-slate-600">Cargando transacciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Transacciones
                </h1>
                <p className="text-slate-600 text-lg">Gestiona todas las transacciones financieras</p>
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

          <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-rose-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Ventas</p>
                  <p className="text-2xl font-bold text-red-700">{transaccionesVenta}</p>
                </div>
                <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Pagos</p>
                  <p className="text-2xl font-bold text-yellow-700">{transaccionesPago}</p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Transacciones</p>
                  <p className="text-2xl font-bold text-blue-700">{totalTransacciones}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
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
                <Filter className="h-5 w-5 text-white" />
              </div>
              Filtros de búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-slate-700">
                  Buscar
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Número documento, cliente, tipo documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFrom" className="text-sm font-medium text-slate-700">
                  Fecha desde
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo" className="text-sm font-medium text-slate-700">
                  Fecha hasta
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setDateFrom("")
                    setDateTo("")
                  }}
                  className="w-full bg-white/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón crear */}
        <div className="flex justify-between items-center">
          <div></div>
          <Dialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              setIsCreateOpen(open)
              if (!open) resetCreateForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl">
                <Plus className="h-5 w-5 mr-2" />
                Nueva Transacción
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Crear Nueva Transacción
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha" className="text-sm font-medium text-slate-700">
                      Fecha
                    </Label>
                    <Input
                      id="fecha"
                      name="fecha"
                      type="date"
                      value={createForm.fecha}
                      onChange={(e) => setCreateForm({ ...createForm, fecha: e.target.value })}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numeroDocumento" className="text-sm font-medium text-slate-700">
                      Número de Documento
                    </Label>
                    <Input
                      id="numeroDocumento"
                      name="numeroDocumento"
                      value={createForm.numeroDocumento}
                      onChange={(e) => setCreateForm({ ...createForm, numeroDocumento: e.target.value })}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tiposDocumentoId" className="text-sm font-medium text-slate-700">
                      Tipo de Documento
                    </Label>
                    <Select
                      name="tiposDocumentoId"
                      value={createForm.tiposDocumentoId}
                      onValueChange={(value) => setCreateForm({ ...createForm, tiposDocumentoId: value })}
                      required
                    >
                      <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg">
                        <SelectValue placeholder="Seleccionar tipo de documento" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposDocumentos.length === 0 && (
                          <SelectItem value="" disabled>No hay tipos de documentos disponibles</SelectItem>
                        )}
                        {tiposDocumentos.filter(tipo => tipo.estado).map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id.toString()}>
                            {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clienteId" className="text-sm font-medium text-slate-700">
                      Cliente
                    </Label>
                    <Select
                      name="clienteId"
                      value={createForm.clienteId}
                      onValueChange={(value) => setCreateForm({ ...createForm, clienteId: value })}
                      required
                    >
                      <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg">
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.length === 0 && (
                          <SelectItem value="" disabled>No hay clientes disponibles</SelectItem>
                        )}
                        {clientes.filter(cliente => cliente.estado).map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id.toString()}>
                            {cliente.nombre} - {cliente.cedula}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monto" className="text-sm font-medium text-slate-700">
                      Monto
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-500 font-medium">$</span>
                      <Input
                        id="monto"
                        name="monto"
                        type="text"
                        value={createForm.monto ? formatCurrency(createForm.monto) : ''}
                        onChange={(e) => handleMontoChange(e.target.value, false)}
                        placeholder="0,000"
                        required
                        className="pl-8 bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false)
                      resetCreateForm()
                    }}
                    className="px-6"
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear Transacción"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabla */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <TableHead className="font-semibold text-slate-700 min-w-[80px]">ID</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">Fecha</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[140px]">Tipo Movimiento</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[150px]">Número Doc.</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[150px]">Cliente</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">Tipo Doc.</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 min-w-[120px]">Monto</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 min-w-[120px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransacciones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No se encontraron transacciones
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransacciones.map((transaccion, index) => (
                      <TableRow
                        key={transaccion.id}
                        className={`hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? "bg-white/30" : "bg-slate-50/30"}`}
                      >
                        <TableCell>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                            {transaccion.id}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaccion.fecha ? new Date(transaccion.fecha).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {transaccion.tipoMovimiento || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaccion.numeroDocumento || "N/A"}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {transaccion.nombreCliente || `Cliente ID: ${transaccion.clienteId}`}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {transaccion.nombreTipoDocumento || `Tipo ID: ${transaccion.tiposDocumentoId}`}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          ${(transaccion.monto || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(transaccion)}
                              className="hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors"
                              disabled={submitting}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteId(transaccion.id)}
                              className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                              disabled={submitting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Paginación */}
            {filteredTransacciones.length > 0 && (
              <div className="p-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>
                      Mostrando {startIndex + 1} a{" "}
                      {Math.min(endIndex, filteredTransacciones.length)} de{" "}
                      {filteredTransacciones.length} resultados
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
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
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
                              variant={
                                currentPage === pageNum
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              className={
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                  : "bg-white/50 border-slate-200 hover:bg-slate-50"
                              }
                            >
                              {pageNum}
                            </Button>
                          )
                        }
                      )}
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de edición */}
        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open)
            if (!open) {
              resetEditForm()
              setEditingTransaccion(null)
            }
          }}
        >
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Editar Transacción
              </DialogTitle>
            </DialogHeader>
            {editingTransaccion && (
              <form onSubmit={handleEdit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-fecha" className="text-sm font-medium text-slate-700">
                      Fecha
                    </Label>
                    <Input
                      id="edit-fecha"
                      name="fecha"
                      type="date"
                      value={editForm.fecha}
                      onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-numeroDocumento" className="text-sm font-medium text-slate-700">
                      Número de Documento
                    </Label>
                    <Input
                      id="edit-numeroDocumento"
                      name="numeroDocumento"
                      value={editForm.numeroDocumento}
                      onChange={(e) => setEditForm({ ...editForm, numeroDocumento: e.target.value })}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-tiposDocumentoId" className="text-sm font-medium text-slate-700">
                      Tipo de Documento
                    </Label>
                    <Select
                      name="tiposDocumentoId"
                      value={editForm.tiposDocumentoId}
                      onValueChange={(value) => setEditForm({ ...editForm, tiposDocumentoId: value })}
                      required
                    >
                      <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposDocumentos.filter(tipo => tipo.estado).map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id.toString()}>
                            {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-clienteId" className="text-sm font-medium text-slate-700">
                      Cliente
                    </Label>
                    <Select
                      name="clienteId"
                      value={editForm.clienteId}
                      onValueChange={(value) => setEditForm({ ...editForm, clienteId: value })}
                      required
                    >
                      <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.filter(cliente => cliente.estado).map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id.toString()}>
                            {cliente.nombre} - {cliente.cedula}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-monto" className="text-sm font-medium text-slate-700">
                      Monto
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-500 font-medium">$</span>
                      <Input
                        id="edit-monto"
                        name="monto"
                        type="text"
                        value={editForm.monto ? formatCurrency(editForm.monto) : ''}
                        onChange={(e) => handleMontoChange(e.target.value, true)}
                        placeholder="0,000"
                        required
                        className="pl-8 bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditOpen(false)
                      resetEditForm()
                      setEditingTransaccion(null)
                    }}
                    className="px-6"
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de confirmación de eliminación */}
        <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-slate-800">¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                Esta acción no se puede deshacer. La transacción será eliminada permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="px-6" disabled={submitting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 px-6"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
