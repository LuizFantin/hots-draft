import { NextRequest, NextResponse } from 'next/server';
import {query} from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { captain1_name, ban_count, first_pick_team } = body;
    
    if (!captain1_name) {
      return NextResponse.json({ error: 'Nome do capitão é obrigatório' }, { status: 400 });
    }
    
    if (!ban_count || ban_count < 0 || ban_count > 5) {
      return NextResponse.json({ error: 'Número de banimentos inválido' }, { status: 400 });
    }
    
    if (first_pick_team !== 1 && first_pick_team !== 2) {
      return NextResponse.json({ error: 'Time de first pick inválido' }, { status: 400 });
    }
    
    // Criar o draft
    const result = await query(
      'INSERT INTO drafts (captain1_name, ban_count, first_pick_team, status, current_phase) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [captain1_name, ban_count, first_pick_team, 'waiting', 'waiting']
    );
    
    const draft = result.rows[0];
    
    return NextResponse.json({ 
      draft,
      is_creator: true // Adicionar flag para identificar o criador
    });
  } catch (error) {
    console.error('Erro ao criar draft:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}