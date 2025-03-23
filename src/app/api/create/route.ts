// src/app/api/draft/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { captain1_name, ban_count = 3 } = await request.json();

    if (!captain1_name) {
      return NextResponse.json(
        { error: 'Nome do primeiro capitão é obrigatório' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO drafts (captain1_name, ban_count) VALUES ($1, $2) RETURNING id',
      [captain1_name, ban_count]
    );

    const draftId = result.rows[0].id;

    return NextResponse.json({ 
      success: true, 
      draft_id: draftId,
      share_link: `/draft/${draftId}`
    });
  } catch (error) {
    console.error('Error creating draft:', error);
    return NextResponse.json(
      { error: 'Erro ao criar o draft' },
      { status: 500 }
    );
  }
}