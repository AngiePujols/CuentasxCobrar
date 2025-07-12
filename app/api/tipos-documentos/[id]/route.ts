import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

// GET /api/tipos-documentos/[id] - Get a specific document type
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const tipoDocumento = dataStore.getTipoDocumento(id)
    
    if (!tipoDocumento) {
      return NextResponse.json(
        { error: 'Tipo de documento no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(tipoDocumento)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener el tipo de documento' },
      { status: 500 }
    )
  }
}

// PUT /api/tipos-documentos/[id] - Update a specific document type
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    const tipoData = {
      nombre: body.nombre,
      descripcion: body.descripcion,
      prefijo: body.prefijo,
      siguienteNumero: Number(body.siguienteNumero),
      activo: body.activo
    }
    
    const updatedTipo = dataStore.updateTipoDocumento(id, tipoData)
    
    if (!updatedTipo) {
      return NextResponse.json(
        { error: 'Tipo de documento no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedTipo)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar el tipo de documento' },
      { status: 500 }
    )
  }
}

// DELETE /api/tipos-documentos/[id] - Delete a specific document type
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const deleted = dataStore.deleteTipoDocumento(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Tipo de documento no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Tipo de documento eliminado exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar el tipo de documento' },
      { status: 500 }
    )
  }
}