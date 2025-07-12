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
      email: body.email,
      telefono: body.telefono,
      direccion: body.direccion,
      ciudad: body.ciudad,
      estado: body.estado,
      codigoPostal: body.codigoPostal,
      estadoCliente: body.estadoCliente || 'Activo',
      limiteCredito: Number(body.limiteCredito) || 0,
      saldoPendiente: Number(body.saldoPendiente) || 0
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