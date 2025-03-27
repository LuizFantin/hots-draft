import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draft_id, captain1_name } = body;
    
    if (!draft_id) {
      return NextResponse.json({ error: 'ID do draft é obrigatório' }, { status: 400 });
    }
    
    if (!captain1_name) {
      return NextResponse.json({ error: 'Nome do capitão é obrigatório' }, { status: 400 });
    }
    
    // Verificar se o draft existe
    const existingDraft = await query(
      'SELECT * FROM drafts WHERE id = $1',
      [draft_id]
    );
    
    if (existingDraft.rows.length === 0) {
      return NextResponse.json({ error: 'Draft não encontrado' }, { status: 404 });
    }
    
    // Verificar se o draft já tem um capitão 1
    if (existingDraft.rows[0].captain1_name) {
      return NextResponse.json({ error: 'Este draft já tem um Capitão 1' }, { status: 400 });
    }
    
    // Atualizar o nome do capitão 1
    const updatedDraft = await query(
      'UPDATE drafts SET captain1_name = $1 WHERE id = $2 RETURNING *',
      [captain1_name, draft_id]
    );
    
    return NextResponse.json({ draft: updatedDraft.rows[0] });
  } catch (error) {
    console.error('Erro ao definir o capitão 1:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}