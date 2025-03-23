// src/app/api/draft/heroes/route.ts
import { NextResponse } from 'next/server';
import { fetchHeroes } from '@/lib/heroesApi';

export async function GET() {
  try {
    const heroes = await fetchHeroes();
    return NextResponse.json({ heroes });
  } catch (error) {
    console.error('Error fetching heroes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar heróis' },
      { status: 500 }
    );
  }
}