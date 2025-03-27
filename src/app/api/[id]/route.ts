import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const {id: draftId} = await params;
    
    if (!draftId) {
      return NextResponse.json(
        { error: 'ID do draft é obrigatório' },
        { status: 400 }
      );
    }
    
    // Buscar o draft e seus picks, bans e map_bans
    const result = await query(
      `SELECT d.*, 
        (SELECT json_agg(p.*) FROM picks p WHERE p.draft_id = d.id) as picks,
        (SELECT json_agg(b.*) FROM bans b WHERE b.draft_id = d.id) as bans,
        (SELECT json_agg(mb.*) FROM map_bans mb WHERE mb.draft_id = d.id) as map_bans
      FROM drafts d
      WHERE d.id = $1`,
      [draftId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Draft não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ draft: result.rows[0] });
  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar draft' },
      { status: 500 }
    );
  }
}