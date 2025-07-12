import { NextRequest, NextResponse } from 'next/server'
import { dataStore, AsientoContable } from '@/lib/data-store'

// GET /api/asientos-contables - Get all accounting entries
export async function GET() {
  try {
    const asientosContables = dataStore.getAsientosContables()
    return NextResponse.json(asientosContables)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener los asientos contables' },
      { status: 500 }
    )
  }
}

// POST /api/asientos-contables - Create a new accounting entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const asientoData = {
      fecha: body.fecha,
      numeroComprobante: body.numeroComprobante,
      concepto: body.concepto,
      tipoDocumentoId: Number(body.tipoDocumentoId),
      clienteId: body.clienteId ? Number(body.clienteId) : undefined,
      totalDebito: Number(body.totalDebito) || 0,
      totalCredito: Number(body.totalCredito) || 0,
      estado: body.estado || 'Borrador'
    }

    const newAsiento = dataStore.createAsientoContable(asientoData)
    
    return NextResponse.json(newAsiento, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear el asiento contable' },
      { status: 500 }
    )
  }
}