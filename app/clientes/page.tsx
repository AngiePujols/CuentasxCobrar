"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  CreditCard,
  Loader2,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/api";

interface Cliente {
  id: number;
  nombre: string;
  cedula: string;
  limiteCredito: number;
  estado: boolean | string; // Handle both boolean from API and string for display
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cedulaError, setCedulaError] = useState("");
  const [editCedulaError, setEditCedulaError] = useState("");
  const { toast } = useToast();

  // Cargar datos desde la API
  useEffect(() => {
    loadClientes();
  }, []);

  // Helper function to convert boolean estado to string
  const getEstadoDisplay = (estado: boolean | string): string => {
    if (typeof estado === "boolean") {
      return estado ? "Activo" : "Inactivo";
    }
    return estado;
  };

  // Helper function to convert string estado to boolean for API
  const getEstadoForAPI = (estadoDisplay: string): boolean => {
    return estadoDisplay === "Activo";
  };

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getClientes();
      // Convert boolean estado to string for display
      const processedData = data.map((cliente: any) => ({
        ...cliente,
        estado: getEstadoDisplay(cliente.estado),
      }));
      setClientes(processedData);
      setFilteredClientes(processedData);
    } catch (error) {
      console.error("Error loading clientes:", error);
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes
  useEffect(() => {
    let filtered = clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cedula.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (estadoFilter && estadoFilter !== "todos") {
      filtered = filtered.filter(
        (cliente) => getEstadoDisplay(cliente.estado) === estadoFilter
      );
    }

    setFilteredClientes(filtered);
  }, [clientes, searchTerm, estadoFilter]);

  // Validar cédula en tiempo real
  const validateCedula = (cedula: string, isEdit = false) => {
    if (!cedula) {
      if (isEdit) {
        setEditCedulaError("");
      } else {
        setCedulaError("");
      }
      return;
    }

    const isValid = ApiService.validarCedula(cedula);
    const errorMessage = isValid ? "" : "La cédula ingresada no es válida";

    if (isEdit) {
      setEditCedulaError(errorMessage);
    } else {
      setCedulaError(errorMessage);
    }

    if (!isValid && cedula.length >= 11) {
      toast({
        title: "❌ Cédula inválida",
        description:
          "La cédula ingresada no es válida. Verifique el formato y dígito verificador.",
        variant: "destructive",
      });
    }
  };

  const handleCreate = async (formData: FormData) => {
    try {
      setSubmitting(true);
      const estadoValue = formData.get("estado") as string;
      const cedulaValue = formData.get("cedula") as string;

      // Validar cédula antes de enviar
      if (!ApiService.validarCedula(cedulaValue)) {
        toast({
          title: "❌ Error de validación",
          description:
            "La cédula ingresada no es válida. Verifique el formato y dígito verificador.",
          variant: "destructive",
        });
        return;
      }

      const newCliente = {
        nombre: formData.get("nombre") as string,
        cedula: cedulaValue,
        limiteCredito:
          Number.parseFloat(formData.get("limiteCredito") as string) || 0,
        estado: getEstadoForAPI(estadoValue),
      };

      await ApiService.createCliente(newCliente);
      await loadClientes(); // Recargar datos
      setIsCreateOpen(false);
      setCedulaError("");
      toast({
        title: "✨ Cliente creado",
        description: "El cliente se ha creado exitosamente.",
      });
    } catch (error) {
      console.error("Error creating cliente:", error);
      toast({
        title: "❌ Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo crear el cliente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (formData: FormData) => {
    if (!editingCliente) return;

    try {
      setSubmitting(true);
      const estadoValue = formData.get("estado") as string;
      const cedulaValue = formData.get("cedula") as string;

      // Validar cédula antes de enviar
      if (!ApiService.validarCedula(cedulaValue)) {
        toast({
          title: "❌ Error de validación",
          description:
            "La cédula ingresada no es válida. Verifique el formato y dígito verificador.",
          variant: "destructive",
        });
        return;
      }

      const updatedCliente = {
        nombre: formData.get("nombre") as string,
        cedula: cedulaValue,
        limiteCredito:
          Number.parseFloat(formData.get("limiteCredito") as string) || 0,
        estado: getEstadoForAPI(estadoValue),
      };

      await ApiService.updateCliente(editingCliente.id, updatedCliente);
      await loadClientes(); // Recargar datos
      setIsEditOpen(false);
      setEditingCliente(null);
      setEditCedulaError("");
      toast({
        title: "🎉 Cliente actualizado",
        description: "El cliente se ha actualizado exitosamente.",
      });
    } catch (error) {
      console.error("Error updating cliente:", error);
      toast({
        title: "❌ Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el cliente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setSubmitting(true);
      await ApiService.deleteCliente(deleteId);
      await loadClientes(); // Recargar datos
      setDeleteId(null);
      toast({
        title: "🗑️ Cliente eliminado",
        description: "El cliente se ha eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting cliente:", error);
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar el cliente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setEditCedulaError("");
    setIsEditOpen(true);
  };

  const openView = (cliente: Cliente) => {
    setViewingCliente(cliente);
    setIsViewOpen(true);
  };

  // Calcular estadísticas
  const clientesActivos = clientes.filter(
    (c) => getEstadoDisplay(c.estado) === "Activo"
  ).length;
  const clientesInactivos = clientes.filter(
    (c) => getEstadoDisplay(c.estado) === "Inactivo"
  ).length;
  const totalLimiteCredito = clientes.reduce(
    (sum, c) => sum + (c.limiteCredito || 0),
    0
  );

  // Function to handle credit limit input validation
  const handleCreditLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or positive numbers (including decimals)
    if (value === '' || (Number(value) >= 0 && !isNaN(Number(value)))) {
      // Value is valid, no action needed
    } else {
      // Prevent negative values
      e.target.value = '0';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-slate-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-auto">
      <div className="container mx-auto p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/20 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Clientes
                </h1>
                <p className="text-slate-600 text-base md:text-lg">
                  Administra la información de todos los clientes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Clientes Activos
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {clientesActivos}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-rose-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">
                    Clientes Inactivos
                  </p>
                  <p className="text-2xl font-bold text-red-700">
                    {clientesInactivos}
                  </p>
                </div>
                <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                  <UserX className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Límite Total
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${totalLimiteCredito.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <CreditCard className="h-6 w-6 text-white" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="search"
                  className="text-sm font-medium text-slate-700"
                >
                  Buscar
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Nombre o cédula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="estado"
                  className="text-sm font-medium text-slate-700"
                >
                  Estado
                </Label>
                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setEstadoFilter("todos");
                  }}
                  className="w-full bg-white/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón crear y Tabla de clientes */}
        <div className="space-y-4 md:space-y-6">
          <div className="flex justify-end">
            <Dialog
              open={isCreateOpen}
              onOpenChange={(open) => {
                setIsCreateOpen(open);
                if (!open) setCedulaError("");
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl">
                  <Plus className="h-5 w-5 mr-2" />
                  Nuevo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
                <DialogHeader className="sticky top-0 bg-white/95 backdrop-blur-sm pb-4 border-b border-slate-200">
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Crear Nuevo Cliente
                  </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-1">
                  <form action={handleCreate} className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="nombre"
                        className="text-sm font-medium text-slate-700"
                      >
                        Nombre *
                      </Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        required
                        className="bg-white border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="cedula"
                        className="text-sm font-medium text-slate-700"
                      >
                        Cédula *
                      </Label>
                      <Input
                        id="cedula"
                        name="cedula"
                        required
                        placeholder="00000000000 o 000-0000000-0"
                        className={`bg-white border-2 focus:ring-2 focus:ring-orange-500/20 rounded-lg ${
                          cedulaError
                            ? "border-red-500 focus:border-red-500"
                            : "border-slate-300 focus:border-orange-500"
                        }`}
                        onChange={(e) => validateCedula(e.target.value)}
                      />
                      {cedulaError && (
                        <p className="text-sm text-red-600 mt-1">
                          {cedulaError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="limiteCredito"
                        className="text-sm font-medium text-slate-700"
                      >
                        Límite de Crédito
                      </Label>
                      <Input
                        id="limiteCredito"
                        name="limiteCredito"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue="0"
                        placeholder="0.00"
                        onChange={handleCreditLimitChange}
                        onKeyDown={(e) => {
                          // Prevent minus key
                          if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                            e.preventDefault();
                          }
                        }}
                        className="bg-white border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg"
                      />
                      <p className="text-xs text-slate-500">Solo se permiten valores positivos</p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="estado"
                        className="text-sm font-medium text-slate-700"
                      >
                        Estado
                      </Label>
                      <Select name="estado" defaultValue="Activo">
                        <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg">
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-4 border-t border-slate-200">
                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsCreateOpen(false);
                            setCedulaError("");
                          }}
                          className="px-6"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting || !!cedulaError}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creando...
                            </>
                          ) : (
                            "Crear Cliente"
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabla de clientes */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Lista de clientes ({filteredClientes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                <table className="w-full min-w-[600px]">
                  <thead className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 bg-white/90">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 bg-white/90">
                        Cédula
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 bg-white/90">
                        Límite de Crédito
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 bg-white/90">
                        Estado
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-slate-700 bg-white/90">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClientes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-slate-500"
                        >
                          No se encontraron clientes
                        </td>
                      </tr>
                    ) : (
                      filteredClientes.map((cliente, index) => (
                        <tr
                          key={cliente.id}
                          className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                            index % 2 === 0 ? "bg-white/30" : "bg-slate-50/30"
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="font-medium text-slate-900 truncate max-w-[200px]">
                              {cliente.nombre}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-700">
                            {cliente.cedula}
                          </td>
                          <td className="py-4 px-4 text-slate-700 font-medium">
                            ${(cliente.limiteCredito || 0).toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                getEstadoDisplay(cliente.estado) === "Activo"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {getEstadoDisplay(cliente.estado)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openView(cliente)}
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 shrink-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(cliente)}
                                className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 shrink-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(cliente.id)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Dialog */}
        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) {
              setEditingCliente(null);
              setEditCedulaError("");
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
            <DialogHeader className="sticky top-0 bg-white/95 backdrop-blur-sm pb-4 border-b border-slate-200">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Editar Cliente
              </DialogTitle>
            </DialogHeader>
            {editingCliente && (
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-1">
                <form action={handleEdit} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-nombre"
                      className="text-sm font-medium text-slate-700"
                    >
                      Nombre *
                    </Label>
                    <Input
                      id="edit-nombre"
                      name="nombre"
                      defaultValue={editingCliente.nombre}
                      required
                      className="bg-white border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-cedula"
                      className="text-sm font-medium text-slate-700"
                    >
                      Cédula *
                    </Label>
                    <Input
                      id="edit-cedula"
                      name="cedula"
                      defaultValue={editingCliente.cedula}
                      required
                      placeholder="00000000000 o 000-0000000-0"
                      className={`bg-white border-2 focus:ring-2 focus:ring-orange-500/20 rounded-lg ${
                        editCedulaError
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-300 focus:border-orange-500"
                      }`}
                      onChange={(e) => validateCedula(e.target.value, true)}
                    />
                    {editCedulaError && (
                      <p className="text-sm text-red-600 mt-1">
                        {editCedulaError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-limiteCredito"
                      className="text-sm font-medium text-slate-700"
                    >
                      Límite de Crédito
                    </Label>
                    <Input
                      id="edit-limiteCredito"
                      name="limiteCredito"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={editingCliente.limiteCredito}
                      placeholder="0.00"
                      onChange={handleCreditLimitChange}
                      onKeyDown={(e) => {
                        // Prevent minus key
                        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                          e.preventDefault();
                        }
                      }}
                      className="bg-white border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg"
                    />
                    <p className="text-xs text-slate-500">Solo se permiten valores positivos</p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-estado"
                      className="text-sm font-medium text-slate-700"
                    >
                      Estado
                    </Label>
                    <Select
                      name="estado"
                      defaultValue={getEstadoDisplay(editingCliente.estado)}
                    >
                      <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg">
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-4 border-t border-slate-200">
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditOpen(false);
                          setEditingCliente(null);
                          setEditCedulaError("");
                        }}
                        className="px-6"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting || !!editCedulaError}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Actualizando...
                          </>
                        ) : (
                          "Actualizar Cliente"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
            <DialogHeader className="sticky top-0 bg-white/95 backdrop-blur-sm pb-4 border-b border-slate-200">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Detalles del Cliente
              </DialogTitle>
            </DialogHeader>
            {viewingCliente && (
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-1">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Nombre
                      </Label>
                      <p className="text-lg font-semibold text-slate-900">
                        {viewingCliente.nombre}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Cédula
                      </Label>
                      <p className="text-lg text-slate-900">
                        {viewingCliente.cedula}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Límite de Crédito
                      </Label>
                      <p className="text-lg font-semibold text-green-600">
                        ${(viewingCliente.limiteCredito || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Estado
                      </Label>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          getEstadoDisplay(viewingCliente.estado) === "Activo"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {getEstadoDisplay(viewingCliente.estado)}
                      </span>
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-4 border-t border-slate-200">
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsViewOpen(false);
                          setViewingCliente(null);
                        }}
                        className="px-6"
                      >
                        Cerrar
                      </Button>
                      <Button
                        onClick={() => {
                          setIsViewOpen(false);
                          openEdit(viewingCliente);
                        }}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6"
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          open={deleteId !== null}
          onOpenChange={(open) => !open && setDeleteId(null)}
        >
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-600">
                ¿Estás seguro de eliminar este cliente?
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 text-slate-700">
              Esta acción es irreversible. Por favor, confirma que deseas
              eliminar este cliente.
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteId(null)}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                disabled={submitting}
                className="bg-red-500 hover:bg-red-600 text-white px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
