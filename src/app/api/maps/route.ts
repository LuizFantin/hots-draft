import { NextResponse } from 'next/server';
import { fetchMaps } from '@/lib/mapsApi';

export async function GET() {
  try {
    const maps = await fetchMaps();
    return NextResponse.json({ maps });
  } catch (error) {
    console.error('Error fetching maps:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar mapas' },
      { status: 500 }
    );
  }
}