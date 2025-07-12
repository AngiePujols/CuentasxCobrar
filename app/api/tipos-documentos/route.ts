import { NextRequest, NextResponse } from 'next/server'
import { dataStore, TipoDocumento } from '@/lib/data-store'

// GET /api/tipos-documentos - Get all document types
export async function GET() {
  try {
    const tiposDocumentos = dataStore.getTiposDocumentos()
    return NextResponse.json(tiposDocumentos)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener los tipos de documentos' },
      { status: 500 }
    )
  }
}

// POST /api/tipos-documentos - Create a new document type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const tipoData = {
      nombre: body.nombre,
      descripcion: body.descripcion,
      prefijo: body.prefijo,
      siguienteNumero: Number(body.siguienteNumero) || 1,
      activo: body.activo !== undefined ? body.activo : true
    }

    const newTipo = dataStore.createTipoDocumento(tipoData)
    
    return NextResponse.json(newTipo, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear el tipo de documento' },
      { status: 500 }
    )
  }
}