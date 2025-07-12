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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiService } from "@/lib/api"

interface Transaccion {
  id: number
  asientoContableId: number
  cuentaContable: string
  descripcion: string
  debito: number
  credito: number
  fechaCreacion: string
}

export default function TransaccionesPage() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [filteredTransacciones, setFilteredTransacciones] = useState<Transaccion[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editingTransaccion, setEditingTransaccion] = useState<Transaccion | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  // Removed tipo and estado filters since they don't apply to the current data structure
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Cargar datos desde la API
  useEffect(() => {
    loadTransacciones()
  }, [])

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
        (transaccion?.cuentaContable?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (transaccion?.descripcion?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
    )

    if (dateFrom) {
      filtered = filtered.filter((transaccion) => (transaccion.fechaCreacion || "") >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((transaccion) => (transaccion.fechaCreacion || "") <= dateTo)
    }
    // Remove tipo and estado filters since those fields don't exist in the API data

    setFilteredTransacciones(filtered)
  }, [transacciones, searchTerm, dateFrom, dateTo])

  const handleCreate = async (formData: FormData) => {
    try {
      setSubmitting(true)
      const newTransaccion = {
        fecha: formData.get("fecha") as string,
        tipoTransaccion: formData.get("tipoTransaccion") as string,
        numeroDocumento: formData.get("numeroDocumento") as string,
        clienteId: Number.parseInt(formData.get("clienteId") as string),
        clienteNombre: formData.get("clienteNombre") as string,
        monto: Number.parseFloat(formData.get("monto") as string),
        estado: formData.get("estado") as string,
        descripcion: formData.get("descripcion") as string,
      }

      await ApiService.createTransaccion(newTransaccion)
      await loadTransacciones() // Recargar datos
      setIsCreateOpen(false)
      toast({
        title: "✨ Transacción creada",
        description: "La transacción se ha creado exitosamente.",
      })
    } catch (error) {
      console.error("Error creating transaccion:", error)
      toast({
        title: "❌ Error",
        description: "No se pudo crear la transacción.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (formData: FormData) => {
    if (!editingTransaccion) return

    try {
      setSubmitting(true)
      const updatedTransaccion = {
        ...editingTransaccion,
        fecha: formData.get("fecha") as string,
        tipoTransaccion: formData.get("tipoTransaccion") as string,
        numeroDocumento: formData.get("numeroDocumento") as string,
        clienteId: Number.parseInt(formData.get("clienteId") as string),
        clienteNombre: formData.get("clienteNombre") as string,
        monto: Number.parseFloat(formData.get("monto") as string),
        estado: formData.get("estado") as string,
        descripcion: formData.get("descripcion") as string,
      }

      await ApiService.updateTransaccion(editingTransaccion.id, updatedTransaccion)
      await loadTransacciones() // Recargar datos
      setIsEditOpen(false)
      setEditingTransaccion(null)
      toast({
        title: "🎉 Transacción actualizada",
        description: "La transacción se ha actualizado exitosamente.",
      })
    } catch (error) {
      console.error("Error updating transaccion:", error)
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar la transacción.",
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
    setIsEditOpen(true)
  }

  // Calcular estadísticas
  const totalDebito = transacciones.reduce((sum, t) => sum + (t.debito || 0), 0)
  const totalCredito = transacciones.reduce((sum, t) => sum + (t.credito || 0), 0)
  const totalTransacciones = transacciones.length
  const balance = totalDebito - totalCredito

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
                  <p className="text-green-600 text-sm font-medium">Total Débito</p>
                  <p className="text-2xl font-bold text-green-700">${totalDebito.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-rose-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Total Crédito</p>
                  <p className="text-2xl font-bold text-red-700">${totalCredito.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Balance</p>
                  <p className="text-2xl font-bold text-yellow-700">${Math.abs(balance).toLocaleString()}</p>
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
                    placeholder="Cuenta contable, descripción..."
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
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
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
              <form action={handleCreate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha" className="text-sm font-medium text-slate-700">
                      Fecha
                    </Label>
                    <Input
                      id="fecha"
                      name="fecha"
                      type="date"
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipoTransaccion" className="text-sm font-medium text-slate-700">
                      Tipo de Transacción
                    </Label>
                    <Select name="tipoTransaccion" defaultValue="Venta">
                      <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Venta">Venta</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                        <SelectItem value="Nota de Crédito">Nota de Crédito</SelectItem>
                        <SelectItem value="Nota de Débito">Nota de Débito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroDocumento" className="text-sm font-medium text-slate-700">
                      Número de Documento
                    </Label>
                    <Input
                      id="numeroDocumento"
                      name="numeroDocumento"
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clienteId" className="text-sm font-medium text-slate-700">
                      ID Cliente
                    </Label>
                    <Input
                      id="clienteId"
                      name="clienteId"
                      type="number"
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clienteNombre" className="text-sm font-medium text-slate-700">
                      Nombre del Cliente
                    </Label>
                    <Input
                      id="clienteNombre"
                      name="clienteNombre"
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monto" className="text-sm font-medium text-slate-700">
                      Monto
                    </Label>
                    <Input
                      id="monto"
                      name="monto"
                      type="number"
                      step="0.01"
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-sm font-medium text-slate-700">
                    Estado
                  </Label>
                  <Select name="estado" defaultValue="Pendiente">
                    <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-sm font-medium text-slate-700">
                    Descripción
                  </Label>
                  <Input
                    id="descripcion"
                    name="descripcion"
                    required
                    className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
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
                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">Fecha Creación</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[140px]">Cuenta Contable</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[200px]">Descripción</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 min-w-[120px]">Débito</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 min-w-[120px]">Crédito</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 min-w-[120px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransacciones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No se encontraron transacciones
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransacciones.map((transaccion, index) => (
                      <TableRow
                        key={transaccion.id}
                        className={`hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? "bg-white/30" : "bg-slate-50/30"}`}
                      >
                        <TableCell className="font-medium">
                          {new Date(transaccion.fechaCreacion || new Date()).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {transaccion.cuentaContable || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{transaccion.descripcion || "Sin descripción"}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {(transaccion.debito || 0) > 0 ? `$${(transaccion.debito || 0).toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {(transaccion.credito || 0) > 0 ? `$${(transaccion.credito || 0).toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(transaccion)}
                              className="h-8 w-8 hover:bg-green-50 hover:text-green-600 transition-colors"
                              disabled={submitting}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(transaccion.id)}
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
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

        {/* Modal de edición */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Editar Transacción
              </DialogTitle>
            </DialogHeader>
            {editingTransaccion && (
              <form action={handleEdit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-fecha" className="text-sm font-medium text-slate-700">
                      Fecha
                    </Label>
                    <Input
                      id="edit-fecha"
                      name="fecha"
                      type="date"
                      defaultValue={editingTransaccion.fecha}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tipoTransaccion" className="text-sm font-medium text-slate-700">
                      Tipo de Transacción
                    </Label>
                    <Select name="tipoTransaccion" defaultValue={editingTransaccion.tipoTransaccion}>
                      <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Venta">Venta</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                        <SelectItem value="Nota de Crédito">Nota de Crédito</SelectItem>
                        <SelectItem value="Nota de Débito">Nota de Débito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-numeroDocumento" className="text-sm font-medium text-slate-700">
                      Número de Documento
                    </Label>
                    <Input
                      id="edit-numeroDocumento"
                      name="numeroDocumento"
                      defaultValue={editingTransaccion.numeroDocumento}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-clienteId" className="text-sm font-medium text-slate-700">
                      ID Cliente
                    </Label>
                    <Input
                      id="edit-clienteId"
                      name="clienteId"
                      type="number"
                      defaultValue={editingTransaccion.clienteId}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-clienteNombre" className="text-sm font-medium text-slate-700">
                      Nombre del Cliente
                    </Label>
                    <Input
                      id="edit-clienteNombre"
                      name="clienteNombre"
                      defaultValue={editingTransaccion.clienteNombre}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-monto" className="text-sm font-medium text-slate-700">
                      Monto
                    </Label>
                    <Input
                      id="edit-monto"
                      name="monto"
                      type="number"
                      step="0.01"
                      defaultValue={editingTransaccion.monto}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-estado" className="text-sm font-medium text-slate-700">
                    Estado
                  </Label>
                  <Select name="estado" defaultValue={editingTransaccion.estado}>
                    <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-descripcion" className="text-sm font-medium text-slate-700">
                    Descripción
                  </Label>
                  <Input
                    id="edit-descripcion"
                    name="descripcion"
                    defaultValue={editingTransaccion.descripcion}
                    required
                    className="bg-white border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg"
                  />
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
