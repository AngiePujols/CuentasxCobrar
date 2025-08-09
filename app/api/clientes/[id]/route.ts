import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

// GET /api/clientes/[id] - Get a specific client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const cliente = dataStore.getCliente(id)
    
    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(cliente)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener el cliente' },
      { status: 500 }
    )
  }
}

// PUT /api/clientes/[id] - Update a specific client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const body = await request.json()
    
    const clienteData = {
      nombre: body.nombre,
      cedula: body.cedula,
      limiteCredito: Number(body.limiteCredito) || 0,
      estado: body.estado
    }
    
    const updatedCliente = dataStore.updateCliente(id, clienteData)
    
    if (!updatedCliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedCliente)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar el cliente' },
      { status: 500 }
    )
  }
}

// DELETE /api/clientes/[id] - Delete a specific client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    const deleted = dataStore.deleteCliente(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Cliente eliminado exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar el cliente' },
      { status: 500 }
    )
  }
}