import { NextRequest, NextResponse } from 'next/server'
import { dataStore, Transaccion } from '@/lib/data-store'

// GET /api/transacciones - Get all transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const asientoId = searchParams.get('asientoId')
    
    let transacciones: Transaccion[]
    
    if (asientoId) {
      // Get transactions for a specific accounting entry
      transacciones = dataStore.getTransaccionesByAsiento(parseInt(asientoId))
    } else {
      // Get all transactions
      transacciones = dataStore.getTransacciones()
    }
    
    return NextResponse.json(transacciones)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las transacciones' },
      { status: 500 }
    )
  }
}

// POST /api/transacciones - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const transaccionData = {
      asientoContableId: Number(body.asientoContableId),
      cuentaContable: body.cuentaContable,
      descripcion: body.descripcion,
      debito: Number(body.debito) || 0,
      credito: Number(body.credito) || 0
    }

    const newTransaccion = dataStore.createTransaccion(transaccionData)
    
    return NextResponse.json(newTransaccion, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear la transacción' },
      { status: 500 }
    )
  }
}