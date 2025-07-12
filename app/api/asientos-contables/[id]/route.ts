import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

// GET /api/asientos-contables/[id] - Get a specific accounting entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const asientoContable = dataStore.getAsientoContable(id)
    
    if (!asientoContable) {
      return NextResponse.json(
        { error: 'Asiento contable no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(asientoContable)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener el asiento contable' },
      { status: 500 }
    )
  }
}

// PUT /api/asientos-contables/[id] - Update a specific accounting entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    const asientoData = {
      fecha: body.fecha,
      numeroComprobante: body.numeroComprobante,
      concepto: body.concepto,
      tipoDocumentoId: Number(body.tipoDocumentoId),
      clienteId: body.clienteId ? Number(body.clienteId) : undefined,
      totalDebito: Number(body.totalDebito) || 0,
      totalCredito: Number(body.totalCredito) || 0,
      estado: body.estado
    }
    
    const updatedAsiento = dataStore.updateAsientoContable(id, asientoData)
    
    if (!updatedAsiento) {
      return NextResponse.json(
        { error: 'Asiento contable no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedAsiento)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar el asiento contable' },
      { status: 500 }
    )
  }
}

// DELETE /api/asientos-contables/[id] - Delete a specific accounting entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const deleted = dataStore.deleteAsientoContable(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Asiento contable no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Asiento contable eliminado exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar el asiento contable' },
      { status: 500 }
    )
  }
}