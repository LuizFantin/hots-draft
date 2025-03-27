import { DraftPhase, Draft } from './types';

// Define a sequência das fases do draft de mapas
const mapDraftSequence: DraftPhase[] = [
  'setup',
  'map_ban1_team1', 'map_ban1_team2',
  'map_ban2_team1', 'map_ban2_team2',
  'map_pick',
];

// Define a sequência das fases do draft com 3 bans para o time 1 como first pick
const draftSequence3BansTeam1: DraftPhase[] = [
  'ban1_team1', 'ban1_team2',
  'ban2_team1', 'ban2_team2',
  'pick1_team1',
  'pick1_team2', 'pick2_team2',
  'pick2_team1','pick3_team1',
  'ban3_team1', 'ban3_team2',
  'pick3_team2', 'pick4_team2',
  'pick4_team1', 'pick5_team1',
  'pick5_team2',
  'completed'
];

// Define a sequência das fases do draft com 3 bans para o time 2 como first pick
const draftSequence3BansTeam2: DraftPhase[] = [
  'ban1_team1', 'ban1_team2',
  'ban2_team1', 'ban2_team2',
  'pick1_team2',
  'pick1_team1', 'pick2_team1',
  'pick2_team2','pick3_team2',
  'ban3_team1', 'ban3_team2',
  'pick3_team1', 'pick4_team1',
  'pick4_team2', 'pick5_team2',
  'pick5_team1',
  'completed'
];

// Define a sequência das fases do draft com 4 bans para o time 1 como first pick
const draftSequence4BansTeam1: DraftPhase[] = [
  'ban1_team1', 'ban1_team2',
  'ban2_team1', 'ban2_team2',
  'ban3_team1', 'ban3_team2',
  'pick1_team1',
  'pick1_team2', 'pick2_team2',
  'pick2_team1', 'pick3_team1',
  'ban4_team1', 'ban4_team2',
  'pick3_team2', 'pick4_team2',
  'pick4_team1', 'pick5_team1',
  'pick5_team2',
  'completed'
];

// Define a sequência das fases do draft com 4 bans para o time 2 como first pick
const draftSequence4BansTeam2: DraftPhase[] = [
  'ban1_team1', 'ban1_team2',
  'ban2_team1', 'ban2_team2',
  'ban3_team1', 'ban3_team2',
  'pick1_team2',
  'pick1_team1', 'pick2_team1',
  'pick2_team2', 'pick3_team2',
  'ban4_team1', 'ban4_team2',
  'pick3_team1', 'pick4_team1',
  'pick4_team2', 'pick5_team2',
  'pick5_team1',
  'completed'
];

// Retorna a próxima fase do draft
export function getNextPhase(draft: Draft): DraftPhase {
  // Se estamos na fase de setup, começamos o draft de mapas
  if (draft.current_phase === 'setup') {
    return 'map_ban1_team1';
  }
  
  // Se estamos no draft de mapas
  if (draft.current_phase.startsWith('map_')) {
    const currentIndex = mapDraftSequence.indexOf(draft.current_phase);
    
    if (currentIndex === -1 || currentIndex === mapDraftSequence.length - 1) {
      // Após o draft de mapas, começamos o draft de heróis
      return 'ban1_team1';
    }
    
    return mapDraftSequence[currentIndex + 1];
  }
  
  // Se estamos no draft de heróis
  let sequence;
  if (draft.ban_count === 4) {
    sequence = draft.first_pick_team === 1 ? draftSequence4BansTeam1 : draftSequence4BansTeam2;
  } else {
    sequence = draft.first_pick_team === 1 ? draftSequence3BansTeam1 : draftSequence3BansTeam2;
  }
  
  const currentIndex = sequence.indexOf(draft.current_phase);
  
  if (currentIndex === -1 || currentIndex === sequence.length - 1) {
    return 'completed';
  }
  
  return sequence[currentIndex + 1];
}

// Verifica a qual time pertence a fase atual
export function getCurrentTeam(phase: DraftPhase): 1 | 2 | null {
  if (phase === 'setup' || phase === 'completed' || phase === 'map_pick') {
    return null;
  }
  
  if (phase.includes('team1')) {
    return 1;
  }
  
  return 2;
}

// Verifica se a fase atual é de ban, pick, map_ban, map_pick, setup ou completed
export function isPhaseType(phase: DraftPhase): 'ban' | 'pick' | 'map_ban' | 'map_pick' | 'setup' | 'completed' {
  if (phase === 'setup') return 'setup';
  if (phase === 'completed') return 'completed';
  if (phase.startsWith('ban')) return 'ban';
  if (phase.startsWith('pick')) return 'pick';
  if (phase === 'map_pick') return 'map_pick';
  if (phase.startsWith('map_ban')) return 'map_ban';
  return 'pick'; // fallback
}

// Retorna uma descrição legível da fase atual
export function getPhaseDescription(phase: DraftPhase): string {
  if (phase === 'setup') return 'Configuração';
  if (phase === 'completed') return 'Draft finalizado';
  
  if (phase === 'map_pick') {
    return 'Escolha do Mapa';
  }
  
  const team = phase.includes('team1') ? 'Time 1' : 'Time 2';
  
  if (phase.startsWith('map_ban')) {
    const number = parseInt(phase.match(/\d+/)?.[0] || '1');
    return `Banimento de Mapa ${number} - ${team}`;
  }
  
  const action = phase.startsWith('ban') ? 'Banimento' : 'Escolha';
  const number = parseInt(phase.match(/\d+/)?.[0] || '1');
  
  return `${action} ${number} - ${team}`;
}

// Determina qual time escolhe o mapa (o time que não tem first pick de heróis)
export function getMapPickTeam(draft: Draft): 1 | 2 {
  return draft.first_pick_team === 1 ? 2 : 1;
}