import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

// GET /api/transacciones/[id] - Get a specific transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const transaccion = dataStore.getTransaccion(id)
    
    if (!transaccion) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(transaccion)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener la transacción' },
      { status: 500 }
    )
  }
}

// PUT /api/transacciones/[id] - Update a specific transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    const transaccionData = {
      asientoContableId: Number(body.asientoContableId),
      cuentaContable: body.cuentaContable,
      descripcion: body.descripcion,
      debito: Number(body.debito) || 0,
      credito: Number(body.credito) || 0
    }
    
    const updatedTransaccion = dataStore.updateTransaccion(id, transaccionData)
    
    if (!updatedTransaccion) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedTransaccion)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar la transacción' },
      { status: 500 }
    )
  }
}

// DELETE /api/transacciones/[id] - Delete a specific transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const deleted = dataStore.deleteTransaccion(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Transacción eliminada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar la transacción' },
      { status: 500 }
    )
  }
}