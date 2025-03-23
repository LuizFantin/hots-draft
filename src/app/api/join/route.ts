import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { draft_id, captain2_name } = await request.json();

    if (!draft_id || !captain2_name) {
      return NextResponse.json(
        { error: 'ID do draft e nome do segundo capitão são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o draft existe e está aguardando
    const checkResult = await query(
      'SELECT * FROM drafts WHERE id = $1',
      [draft_id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Draft não encontrado' },
        { status: 404 }
      );
    }

    const draft = checkResult.rows[0];
    
    if (draft.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Este draft já foi iniciado ou finalizado' },
        { status: 400 }
      );
    }

    if (draft.captain2_name) {
      return NextResponse.json(
        { error: 'Este draft já possui um segundo capitão' },
        { status: 400 }
      );
    }

    // Atualizar o draft com o segundo capitão
    await query(
      'UPDATE drafts SET captain2_name = $1 WHERE id = $2',
      [captain2_name, draft_id]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Capitão adicionado com sucesso'
    });
  } catch (error) {
    console.error('Error joining draft:', error);
    return NextResponse.json(
      { error: 'Erro ao entrar no draft' },
      { status: 500 }
    );
  }
}