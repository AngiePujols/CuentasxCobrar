"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Edit,
  Trash2,
  Search,
  Filter,
  FileType,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/api";

interface TipoDocumento {
  id: number;
  nombre: string;
  cuentaContable: string;
  estado: boolean;
}

export default function TiposDocumentosPage() {
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [filteredTipos, setFilteredTipos] = useState<TipoDocumento[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingTipo, setEditingTipo] = useState<TipoDocumento | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [createForm, setCreateForm] = useState({
    nombre: "",
    cuentaContable: "",
    estado: "",
  });
  const [editForm, setEditForm] = useState({
    nombre: "",
    cuentaContable: "",
    estado: "",
  });
  const { toast } = useToast();

  // Cargar datos desde la API
  useEffect(() => {
    loadTipos();
  }, []);

  const loadTipos = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTiposDocumentos();
      setTipos(data);
      setFilteredTipos(data);
    } catch (error) {
      console.error("Error loading tipos:", error);
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los tipos de documentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar tipos
  useEffect(() => {
    let filtered = tipos.filter(
      (tipo) =>
        (tipo.nombre?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (tipo.cuentaContable?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        )
    );

    if (estadoFilter && estadoFilter !== "todos") {
      if (estadoFilter === "activo") {
        filtered = filtered.filter((tipo) => tipo.estado === true);
      } else if (estadoFilter === "inactivo") {
        filtered = filtered.filter((tipo) => tipo.estado === false);
      }
    }

    setFilteredTipos(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [tipos, searchTerm, estadoFilter]);

  // Calcular datos paginados
  const totalPages = Math.ceil(filteredTipos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTipos = filteredTipos.slice(startIndex, endIndex);

  // Funciones de navegación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // Función para limpiar formulario de crear
  const resetCreateForm = () => {
    setCreateForm({
      nombre: "",
      cuentaContable: "",
      estado: "",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (
      !createForm.nombre ||
      !createForm.cuentaContable ||
      !createForm.estado
    ) {
      toast({
        title: "❌ Error de validación",
        description: "Todos los campos son requeridos.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const newTipo = {
        id: 0, // Se autogenera en el backend
        nombre: createForm.nombre.trim(),
        cuentaContable: createForm.cuentaContable.trim(),
        estado: createForm.estado === "true",
      };

      console.log("Datos a enviar:", newTipo);

      await ApiService.createTipoDocumento(newTipo);
      await loadTipos(); // Recargar datos
      setIsCreateOpen(false);
      resetCreateForm(); // Limpiar formulario
      toast({
        title: "✨ Tipo de documento creado",
        description: "El tipo de documento se ha creado exitosamente.",
      });
    } catch (error) {
      console.error("Error creating tipo:", error);
      toast({
        title: "❌ Error",
        description: "No se pudo crear el tipo de documento.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Función para limpiar formulario de editar
  const resetEditForm = () => {
    setEditForm({
      nombre: "",
      cuentaContable: "",
      estado: "",
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTipo) return;

    // Validación básica
    if (!editForm.nombre || !editForm.cuentaContable || !editForm.estado) {
      toast({
        title: "❌ Error de validación",
        description: "Todos los campos son requeridos.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const updatedTipo = {
        id: editingTipo.id,
        nombre: editForm.nombre.trim(),
        cuentaContable: editForm.cuentaContable.trim(),
        estado: editForm.estado === "true",
      };

      console.log("Datos a actualizar:", updatedTipo);

      await ApiService.updateTipoDocumento(editingTipo.id, updatedTipo);
      await loadTipos(); // Recargar datos
      setIsEditOpen(false);
      setEditingTipo(null);
      resetEditForm();
      toast({
        title: "🎉 Tipo de documento actualizado",
        description: "El tipo de documento se ha actualizado exitosamente.",
      });
    } catch (error) {
      console.error("Error updating tipo:", error);
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar el tipo de documento.",
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
      await ApiService.deleteTipoDocumento(deleteId);
      await loadTipos(); // Recargar datos
      setDeleteId(null);
      toast({
        title: "🗑️ Tipo de documento eliminado",
        description: "El tipo de documento se ha eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting tipo:", error);
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar el tipo de documento.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (tipo: TipoDocumento) => {
    setEditingTipo(tipo);
    setEditForm({
      nombre: tipo.nombre || "",
      cuentaContable: tipo.cuentaContable || "",
      estado: tipo.estado ? "true" : "false",
    });
    setIsEditOpen(true);
  };

  const tiposActivos = tipos.filter((t) => t.estado === true).length;
  const tiposInactivos = tipos.filter((t) => t.estado === false).length;
  const totalTipos = tipos.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-slate-600">Cargando tipos de documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                <FileType className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Tipos de Documentos
                </h1>
                <p className="text-slate-600 text-lg">
                  Configura los tipos de documentos del sistema
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Tipos Activos
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {tiposActivos}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
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
                    Tipos Inactivos
                  </p>
                  <p className="text-2xl font-bold text-red-700">
                    {tiposInactivos}
                  </p>
                </div>
                <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">
                    Total Tipos
                  </p>
                  <p className="text-2xl font-bold text-purple-700">
                    {tipos.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    placeholder="Nombre o cuenta contable..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg"
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
                  <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
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

        {/* Botón crear */}
        <div className="flex justify-between items-center">
          <div></div>
          <Dialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) resetCreateForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl">
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Tipo de Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Crear Nuevo Tipo de Documento
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="nombre"
                    className="text-sm font-medium text-slate-700"
                  >
                    Nombre
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={createForm.nombre}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, nombre: e.target.value })
                    }
                    required
                    className="bg-white border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="cuentaContable"
                    className="text-sm font-medium text-slate-700"
                  >
                    Cuenta Contable
                  </Label>
                  <Input
                    id="cuentaContable"
                    name="cuentaContable"
                    value={createForm.cuentaContable}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        cuentaContable: e.target.value,
                      })
                    }
                    required
                    className="bg-white border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="estado"
                    className="text-sm font-medium text-slate-700"
                  >
                    Estado
                  </Label>
                  <Select
                    name="estado"
                    value={createForm.estado}
                    onValueChange={(value) =>
                      setCreateForm({ ...createForm, estado: value })
                    }
                    required
                  >
                    <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      resetCreateForm();
                    }}
                    className="px-6"
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear Tipo"
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
                    <TableHead className="font-semibold text-slate-700 min-w-[80px]">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[200px]">
                      Nombre
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[200px]">
                      Cuenta Contable
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">
                      Estado
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 min-w-[120px]">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTipos.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-slate-500"
                      >
                        No se encontraron tipos de documentos
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTipos.map((tipo, index) => (
                      <TableRow
                        key={tipo.id}
                        className={`hover:bg-slate-50/50 transition-colors ${
                          index % 2 === 0 ? "bg-white/30" : "bg-slate-50/30"
                        }`}
                      >
                        <TableCell>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                            {tipo.id}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {tipo.nombre || "N/A"}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {tipo.cuentaContable || "N/A"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                              tipo.estado
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {tipo.estado ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {tipo.estado ? "Activo" : "Inactivo"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(tipo)}
                              className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 transition-colors"
                              disabled={submitting}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteId(tipo.id)}
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
            {filteredTipos.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>
                        Mostrando {startIndex + 1} a{" "}
                        {Math.min(endIndex, filteredTipos.length)} de{" "}
                        {filteredTipos.length} resultados
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
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
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
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                    : "bg-white/50 border-slate-200 hover:bg-slate-50"
                                }
                              >
                                {pageNum}
                              </Button>
                            );
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
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Modal de edición */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) {
            resetEditForm()
            setEditingTipo(null)
          }
        }}>
          <DialogContent className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Editar Tipo de Documento
              </DialogTitle>
            </DialogHeader>
            {editingTipo && (
              <form onSubmit={handleEdit} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-nombre"
                    className="text-sm font-medium text-slate-700"
                  >
                    Nombre
                  </Label>
                  <Input
                    id="edit-nombre"
                    name="nombre"
                    value={editForm.nombre}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nombre: e.target.value })
                    }
                    required
                    className="bg-white border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-cuentaContable"
                    className="text-sm font-medium text-slate-700"
                  >
                    Cuenta Contable
                  </Label>
                  <Input
                    id="edit-cuentaContable"
                    name="cuentaContable"
                    value={editForm.cuentaContable}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        cuentaContable: e.target.value,
                      })
                    }
                    required
                    className="bg-white border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg"
                  />
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
                    value={editForm.estado}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, estado: value })
                    }
                    required
                  >
                    <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditOpen(false)
                      resetEditForm()
                      setEditingTipo(null)
                    }}
                    className="px-6"
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6"
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
        <AlertDialog
          open={deleteId !== null}
          onOpenChange={() => setDeleteId(null)}
        >
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-slate-800">
                ¿Estás seguro?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                Esta acción no se puede deshacer. El tipo de documento será
                eliminado permanentemente.
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
  );
}
