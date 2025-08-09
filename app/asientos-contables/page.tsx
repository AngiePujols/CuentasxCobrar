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
import { Plus, Edit, Trash2, Search, Filter, TrendingUp, DollarSign, FileText, Activity, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiService } from "@/lib/api"

interface AsientoContable {
  id: number
  nombre: string
  clienteId: number
  nombreCliente?: string
  cuenta: string
  tipoMovimiento: string
  fechaAsiento: string
  montoAsiento: number
  estado: boolean
}

export default function AsientosContablesPage() {
  const [asientos, setAsientos] = useState<AsientoContable[]>([])
  const [filteredAsientos, setFilteredAsientos] = useState<AsientoContable[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editingAsiento, setEditingAsiento] = useState<AsientoContable | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [createForm, setCreateForm] = useState({
    nombre: "",
    clienteId: "",
    cuenta: "",
    tipoMovimiento: "",
    fechaAsiento: "",
    montoAsiento: "",
    estado: ""
  })
  const { toast } = useToast()

  // Cargar datos desde la API
  useEffect(() => {
    loadAsientos()
  }, [])

  const loadAsientos = async () => {
    try {
      setLoading(true)
      const data = await ApiService.getAsientosContables()
      setAsientos(data)
      setFilteredAsientos(data)
    } catch (error) {
      console.error("Error loading asientos:", error)
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los asientos contables.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar asientos
  useEffect(() => {
    let filtered = asientos.filter(
      (asiento) =>
        (asiento?.cuenta?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (asiento?.nombre?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (asiento?.nombreCliente?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
    )

    if (dateFrom) {
      filtered = filtered.filter((asiento) => (asiento.fechaAsiento || "") >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((asiento) => (asiento.fechaAsiento || "") <= dateTo)
    }

    setFilteredAsientos(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [asientos, searchTerm, dateFrom, dateTo])

  // Calcular datos paginados
  const totalPages = Math.ceil(filteredAsientos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAsientos = filteredAsientos.slice(startIndex, endIndex)

  // Funciones de navegación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  // Función para limpiar formulario de crear
  const resetCreateForm = () => {
    setCreateForm({
      nombre: "",
      clienteId: "",
      cuenta: "",
      tipoMovimiento: "",
      fechaAsiento: "",
      montoAsiento: "",
      estado: ""
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación básica
    if (!createForm.nombre || !createForm.clienteId || !createForm.cuenta || 
        !createForm.tipoMovimiento || !createForm.fechaAsiento || !createForm.montoAsiento || !createForm.estado) {
      toast({
        title: "❌ Error de validación",
        description: "Todos los campos son requeridos.",
        variant: "destructive",
      })
      return
    }

    // Validación de números
    const clienteId = Number(createForm.clienteId)
    const montoAsiento = Number.parseFloat(createForm.montoAsiento)
    
    if (isNaN(clienteId) || clienteId <= 0) {
      toast({
        title: "❌ Error de validación",
        description: "El ID del cliente debe ser un número válido mayor a 0.",
        variant: "destructive",
      })
      return
    }

    if (isNaN(montoAsiento) || montoAsiento <= 0) {
      toast({
        title: "❌ Error de validación",
        description: "El monto debe ser un número válido mayor a 0.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      // Convertir fecha a formato ISO con tiempo (UTC)
      const fechaISO = new Date(createForm.fechaAsiento + 'T12:00:00.000Z').toISOString()
      
      const newAsiento = {
        id: 0, // Se autogenera en el backend
        nombre: createForm.nombre.trim(),
        clienteId: clienteId,
        nombreCliente: "", // Se llena automáticamente en el backend
        cuenta: createForm.cuenta.trim(),
        tipoMovimiento: createForm.tipoMovimiento,
        fechaAsiento: fechaISO,
        montoAsiento: montoAsiento,
        estado: createForm.estado === "true",
      }

      console.log("Datos a enviar:", newAsiento)
      console.log("Datos a enviar (JSON):", JSON.stringify(newAsiento, null, 2))

      await ApiService.createAsientoContable(newAsiento)
      await loadAsientos() // Recargar datos
      setIsCreateOpen(false)
      resetCreateForm() // Limpiar formulario
      toast({
        title: "✨ Asiento creado",
        description: "El asiento contable se ha creado exitosamente.",
      })
    } catch (error) {
      console.error("Error creating asiento:", error)
      let errorMessage = "No se pudo crear el asiento contable."
      
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "Error de conexión. Verifique que el servidor esté ejecutándose."
        } else if (error.message.includes("400")) {
          errorMessage = "Datos inválidos. Verifique que todos los campos estén correctos."
        } else if (error.message.includes("500")) {
          errorMessage = "Error interno del servidor. Intente nuevamente."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "❌ Error al crear asiento",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (formData: FormData) => {
    if (!editingAsiento) return

    try {
      setSubmitting(true)
      const updatedAsiento = {
        ...editingAsiento,
        nombre: formData.get("nombre") as string,
        clienteId: Number(formData.get("clienteId")) || editingAsiento.clienteId,
        cuenta: formData.get("cuenta") as string,
        tipoMovimiento: formData.get("tipoMovimiento") as string,
        fechaAsiento: formData.get("fechaAsiento") as string,
        montoAsiento: Number.parseFloat(formData.get("montoAsiento") as string) || 0,
        estado: formData.get("estado") === "true",
      }

      await ApiService.updateAsientoContable(editingAsiento.id, updatedAsiento)
      await loadAsientos() // Recargar datos
      setIsEditOpen(false)
      setEditingAsiento(null)
      toast({
        title: "🎉 Asiento actualizado",
        description: "El asiento contable se ha actualizado exitosamente.",
      })
    } catch (error) {
      console.error("Error updating asiento:", error)
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar el asiento contable.",
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
      await ApiService.deleteAsientoContable(deleteId)
      await loadAsientos() // Recargar datos
      setDeleteId(null)
      toast({
        title: "🗑️ Asiento eliminado",
        description: "El asiento contable se ha eliminado exitosamente.",
      })
    } catch (error) {
      console.error("Error deleting asiento:", error)
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar el asiento contable.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (asiento: AsientoContable) => {
    setEditingAsiento(asiento)
    setIsEditOpen(true)
  }

  // Calcular estadísticas
  const totalMonto = asientos.reduce((sum, a) => sum + (a.montoAsiento || 0), 0)
  const totalActivos = asientos.filter(a => a.estado).length
  const totalInactivos = asientos.filter(a => !a.estado).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-slate-600">Cargando asientos contables...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Asientos Contables
                </h1>
                <p className="text-slate-600 text-lg">Gestiona los movimientos contables del sistema</p>
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
                  <p className="text-red-600 text-sm font-medium">Activos</p>
                  <p className="text-2xl font-bold text-red-700">{totalActivos}</p>
                </div>
                <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Inactivos</p>
                  <p className="text-2xl font-bold text-blue-700">{totalInactivos}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Asientos</p>
                  <p className="text-2xl font-bold text-purple-700">{asientos.length}</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-slate-700">
                  Buscar
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Nombre, cuenta o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
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
                  className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
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
                  className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
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
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) resetCreateForm()
        }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl">
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Asiento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Crear Nuevo Asiento Contable
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-sm font-medium text-slate-700">
                    Nombre del Asiento
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={createForm.nombre}
                    onChange={(e) => setCreateForm({...createForm, nombre: e.target.value})}
                    required
                    className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clienteId" className="text-sm font-medium text-slate-700">
                    Cliente ID
                  </Label>
                  <Input
                    id="clienteId"
                    name="clienteId"
                    type="number"
                    value={createForm.clienteId}
                    onChange={(e) => setCreateForm({...createForm, clienteId: e.target.value})}
                    required
                    className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuenta" className="text-sm font-medium text-slate-700">
                    Cuenta
                  </Label>
                  <Input
                    id="cuenta"
                    name="cuenta"
                    value={createForm.cuenta}
                    onChange={(e) => setCreateForm({...createForm, cuenta: e.target.value})}
                    required
                    className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoMovimiento" className="text-sm font-medium text-slate-700">
                      Tipo de Movimiento
                    </Label>
                    <Select name="tipoMovimiento" value={createForm.tipoMovimiento} onValueChange={(value) => setCreateForm({...createForm, tipoMovimiento: value})} required>
                      <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-blue-500">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Debito">Débito</SelectItem>
                        <SelectItem value="Credito">Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaAsiento" className="text-sm font-medium text-slate-700">
                      Fecha del Asiento
                    </Label>
                    <Input
                      id="fechaAsiento"
                      name="fechaAsiento"
                      type="date"
                      value={createForm.fechaAsiento}
                      onChange={(e) => setCreateForm({...createForm, fechaAsiento: e.target.value})}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="montoAsiento" className="text-sm font-medium text-slate-700">
                      Monto del Asiento
                    </Label>
                    <Input
                      id="montoAsiento"
                      name="montoAsiento"
                      type="number"
                      step="0.01"
                      value={createForm.montoAsiento}
                      onChange={(e) => setCreateForm({...createForm, montoAsiento: e.target.value})}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado" className="text-sm font-medium text-slate-700">
                      Estado
                    </Label>
                    <Select name="estado" value={createForm.estado} onValueChange={(value) => setCreateForm({...createForm, estado: value})} required>
                      <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-blue-500">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
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
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-6"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear Asiento"
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
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <TableHead className="font-semibold text-slate-700 min-w-[150px]">Nombre</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[150px]">Cliente</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">Cuenta</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">Tipo Movimiento</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">Fecha</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 min-w-[120px]">Monto</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[100px]">Estado</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 min-w-[120px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAsientos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No se encontraron asientos contables
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAsientos.map((asiento, index) => (
                      <TableRow
                        key={asiento.id}
                        className={`hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? "bg-white/30" : "bg-slate-50/30"}`}
                      >
                        <TableCell className="font-medium">{asiento.nombre || "N/A"}</TableCell>
                        <TableCell>{asiento.nombreCliente || "N/A"}</TableCell>
                        <TableCell>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {asiento.cuenta || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>{asiento.tipoMovimiento || "N/A"}</TableCell>
                        <TableCell className="font-medium">{new Date(asiento.fechaAsiento || new Date()).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          ${(asiento.montoAsiento || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            asiento.estado 
                              ? "bg-green-100 text-green-700 border-green-200" 
                              : "bg-red-100 text-red-700 border-red-200"
                          }`}>
                            {asiento.estado ? "Activo" : "Inactivo"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(asiento)}
                              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                              disabled={submitting}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteId(asiento.id)}
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
          </CardContent>
        </Card>

        {/* Paginación */}
        {filteredAsientos.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAsientos.length)} de {filteredAsientos.length} resultados
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
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
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

        {/* Modal de edición */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Editar Asiento Contable
              </DialogTitle>
            </DialogHeader>
            {editingAsiento && (
              <form action={handleEdit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-nombre" className="text-sm font-medium text-slate-700">
                    Nombre del Asiento
                  </Label>
                  <Input
                    id="edit-nombre"
                    name="nombre"
                    defaultValue={editingAsiento.nombre || ""}
                    required
                    className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-clienteId" className="text-sm font-medium text-slate-700">
                    Cliente ID
                  </Label>
                  <Input
                    id="edit-clienteId"
                    name="clienteId"
                    type="number"
                    defaultValue={editingAsiento.clienteId || 0}
                    required
                    className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cuenta" className="text-sm font-medium text-slate-700">
                    Cuenta
                  </Label>
                  <Input
                    id="edit-cuenta"
                    name="cuenta"
                    defaultValue={editingAsiento.cuenta || ""}
                    required
                    className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-tipoMovimiento" className="text-sm font-medium text-slate-700">
                      Tipo de Movimiento
                    </Label>
                    <Select name="tipoMovimiento" defaultValue={editingAsiento.tipoMovimiento || ""} required>
                      <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-blue-500">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Debito">Débito</SelectItem>
                        <SelectItem value="Credito">Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-fechaAsiento" className="text-sm font-medium text-slate-700">
                      Fecha del Asiento
                    </Label>
                    <Input
                      id="edit-fechaAsiento"
                      name="fechaAsiento"
                      type="date"
                      defaultValue={editingAsiento.fechaAsiento?.split('T')[0] || ""}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-montoAsiento" className="text-sm font-medium text-slate-700">
                      Monto del Asiento
                    </Label>
                    <Input
                      id="edit-montoAsiento"
                      name="montoAsiento"
                      type="number"
                      step="0.01"
                      defaultValue={editingAsiento.montoAsiento || 0}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-estado" className="text-sm font-medium text-slate-700">
                      Estado
                    </Label>
                    <Select name="estado" defaultValue={editingAsiento.estado ? "true" : "false"} required>
                      <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-blue-500">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                    className="px-6"
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-6"
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
                Esta acción no se puede deshacer. El asiento contable será eliminado permanentemente.
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
