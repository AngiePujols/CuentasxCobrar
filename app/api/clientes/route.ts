import { NextRequest, NextResponse } from 'next/server'
import { dataStore, Cliente } from '@/lib/data-store'

// GET /api/clientes - Get all clients
export async function GET() {
  try {
    const clientes = dataStore.getClientes()
    return NextResponse.json(clientes)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener los clientes' },
      { status: 500 }
    )
  }
}

// POST /api/clientes - Create a new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const clienteData = {
      nombre: body.nombre,
      cedula: body.cedula,
      limiteCredito: Number(body.limiteCredito) || 0,
      estado: body.estado || 'Activo'
    }

    const newCliente = dataStore.createCliente(clienteData)
    
    return NextResponse.json(newCliente, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear el cliente' },
      { status: 500 }
    )
  }
}