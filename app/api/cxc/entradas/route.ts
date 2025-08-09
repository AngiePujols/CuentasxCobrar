import { NextRequest, NextResponse } from 'next/server';
import { toISOFromEs } from '@/lib/dates';
import { extractId } from '@/lib/ids';
import type { EntradaContable, EntradaRespuesta } from '@/types/accounting';

const API_BASE_URL = 'http://3.80.223.142:3001/api/public/entradas-contables';

function validateEnvVars() {
  const apiKey = process.env.CXC_API_KEY;
  if (!apiKey) {
    throw new Error('CXC_API_KEY environment variable is required');
  }
  return {
    apiKey,
    cuentaCxC: process.env.CUENTA_CXC || '1101',
    cuentaContra: process.env.CUENTA_CONTRA || '4101',
  };
}

function isDateInRange(dateStr: string, from: string, to: string): boolean {
  try {
    const date = new Date(dateStr);
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return date >= fromDate && date <= toDate;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { apiKey } = validateEnvVars();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch entries from external API' },
        { status: response.status }
      );
    }

    let data = await response.json();
    
    // Ensure data is an array or has items property
    let items = Array.isArray(data) ? data : (data.items || []);

    // Apply date filtering if from/to parameters are provided
    if (from && to) {
      items = items.filter((item: any) => {
        const itemDate = item.fecha || item.date || item.fechaCreacion;
        return itemDate ? isDateInRange(itemDate, from, to) : false;
      });
    }

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('GET /api/cxc/entradas error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, cuentaCxC, cuentaContra } = validateEnvVars();
    
    const body = await request.json();
    const { idTransaccion, descripcion, fechaTransaccion, monto } = body;

    // Validate required fields
    if (!idTransaccion || !descripcion || !fechaTransaccion || !monto) {
      return NextResponse.json(
        { error: 'Missing required fields: idTransaccion, descripcion, fechaTransaccion, monto' },
        { status: 400 }
      );
    }

    if (monto <= 0) {
      return NextResponse.json(
        { error: 'Monto must be greater than 0' },
        { status: 400 }
      );
    }

    // Convert date format
    let fechaISO: string;
    try {
      fechaISO = toISOFromEs(fechaTransaccion);
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid date format: ${fechaTransaccion}. Use "DD de Mes" format.` },
        { status: 400 }
      );
    }

    // Build payload for external API
    const payload: EntradaContable = {
      fecha: fechaISO,
      descripcion: `CxC Transaccion #${idTransaccion} - ${descripcion}`,
      movimientos: [
        { cuenta: cuentaCxC, debe: monto, haber: 0 },
        { cuenta: cuentaContra, debe: 0, haber: monto }
      ]
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('External API POST error:', response.status, response.statusText);
      const errorText = await response.text().catch(() => '');
      return NextResponse.json(
        { error: 'Failed to create entry in external API', details: errorText },
        { status: response.status }
      );
    }

    const data: EntradaRespuesta = await response.json();
    const idAsiento = extractId(data);

    return NextResponse.json(
      { idAsiento, raw: data },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/cxc/entradas error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}