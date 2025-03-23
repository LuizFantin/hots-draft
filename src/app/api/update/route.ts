import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getNextPhase } from '@/lib/draftLogic';
import { Draft } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { draft_id, action, hero_id } = await request.json();

    if (!draft_id || !action) {
      return NextResponse.json(
        { error: 'ID do draft e ação são obrigatórios' },
        { status: 400 }
      );
    }

    // Obter o estado atual do draft
    const draftResult = await query(
      `SELECT d.*, 
        (SELECT json_agg(p.*) FROM picks p WHERE p.draft_id = d.id) as picks,
        (SELECT json_agg(b.*) FROM bans b WHERE b.draft_id = d.id) as bans
      FROM drafts d
      WHERE d.id = $1`,
      [draft_id]
    );

    if (draftResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Draft não encontrado' },
        { status: 404 }
      );
    }

    const draft: Draft = draftResult.rows[0];
    
    // Verificar se o draft está ativo
    if (draft.status === 'completed') {
      return NextResponse.json(
        { error: 'Este draft já foi finalizado' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'start':
        // Iniciar o draft (mudar para o status ativo e para a primeira fase)
        if (draft.status !== 'waiting' || !draft.captain2_name) {
          return NextResponse.json(
            { error: 'Draft não pode ser iniciado' },
            { status: 400 }
          );
        }
        
        await query(
          'UPDATE drafts SET status = $1, current_phase = $2 WHERE id = $3',
          ['active', 'ban1_team1', draft_id]
        );
        break;
        
      case 'ban':
        // Verificar se a fase atual é de ban
        if (!draft.current_phase.startsWith('ban')) {
          return NextResponse.json(
            { error: 'Fase atual não é de banimento' },
            { status: 400 }
          );
        }
        
        if (!hero_id) {
          return NextResponse.json(
            { error: 'ID do herói é obrigatório para banimento' },
            { status: 400 }
          );
        }
        
        // Verificar qual time está fazendo o ban
        const teamBan = draft.current_phase.includes('team1') ? 1 : 2;
        const banOrder = draft.bans ? draft.bans.length + 1 : 1;
        
        // Registrar o ban
        await query(
          'INSERT INTO bans (draft_id, team, hero_id, ban_order) VALUES ($1, $2, $3, $4)',
          [draft_id, teamBan, hero_id, banOrder]
        );
        
        // Avançar para a próxima fase
        const nextPhaseBan = getNextPhase(draft);
        await query(
          'UPDATE drafts SET current_phase = $1, updated_at = NOW() WHERE id = $2',
          [nextPhaseBan, draft_id]
        );
        
        // Se a próxima fase for "completed", atualizar o status do draft
        if (nextPhaseBan === 'completed') {
          await query(
            'UPDATE drafts SET status = $1 WHERE id = $2',
            ['completed', draft_id]
          );
        }
        break;
        
      case 'pick':
        // Verificar se a fase atual é de pick
        if (!draft.current_phase.startsWith('pick')) {
          return NextResponse.json(
            { error: 'Fase atual não é de escolha' },
            { status: 400 }
          );
        }
        
        if (!hero_id) {
          return NextResponse.json(
            { error: 'ID do herói é obrigatório para escolha' },
            { status: 400 }
          );
        }
        
        // Verificar qual time está fazendo o pick
        const teamPick = draft.current_phase.includes('team1') ? 1 : 2;
        const pickOrder = draft.picks ? draft.picks.length + 1 : 1;
        
        // Registrar o pick
        await query(
          'INSERT INTO picks (draft_id, team, hero_id, pick_order) VALUES ($1, $2, $3, $4)',
          [draft_id, teamPick, hero_id, pickOrder]
        );
        
        // Avançar para a próxima fase
        const nextPhasePick = getNextPhase(draft);
        await query(
          'UPDATE drafts SET current_phase = $1, updated_at = NOW() WHERE id = $2',
          [nextPhasePick, draft_id]
        );
        
        // Se a próxima fase for "completed", atualizar o status do draft
        if (nextPhasePick === 'completed') {
          await query(
            'UPDATE drafts SET status = $1 WHERE id = $2',
            ['completed', draft_id]
          );
        }
        break;
        
      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        );
    }

    // Obter o estado atualizado do draft
    const updatedDraftResult = await query(
      `SELECT d.*, 
        (SELECT json_agg(p.*) FROM picks p WHERE p.draft_id = d.id) as picks,
        (SELECT json_agg(b.*) FROM bans b WHERE b.draft_id = d.id) as bans
      FROM drafts d
      WHERE d.id = $1`,
      [draft_id]
    );

    return NextResponse.json({ 
      success: true, 
      draft: updatedDraftResult.rows[0]
    });
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar o draft' },
      { status: 500 }
    );
  }
}