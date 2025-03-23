import { DraftPhase, Draft } from './types';

// Define a sequência das fases do draft com 3 bans
const draftSequence3Bans: DraftPhase[] = [
  'setup',
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

// Define a sequência das fases do draft com 4 bans
const draftSequence4Bans: DraftPhase[] = [
  'setup',
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

// Retorna a próxima fase do draft
export function getNextPhase(draft: Draft): DraftPhase {
  const sequence = draft.ban_count === 4 ? draftSequence4Bans : draftSequence3Bans;
  const currentIndex = sequence.indexOf(draft.current_phase);
  
  if (currentIndex === -1 || currentIndex === sequence.length - 1) {
    return 'completed';
  }
  
  return sequence[currentIndex + 1];
}

// Verifica a qual time pertence a fase atual
export function getCurrentTeam(phase: DraftPhase): 1 | 2 | null {
  if (phase === 'setup' || phase === 'completed') {
    return null;
  }
  
  if (phase.includes('team1')) {
    return 1;
  }
  
  return 2;
}

// Verifica se a fase atual é de ban ou pick
export function isPhaseType(phase: DraftPhase): 'ban' | 'pick' | 'setup' | 'completed' {
  if (phase === 'setup') return 'setup';
  if (phase === 'completed') return 'completed';
  if (phase.startsWith('ban')) return 'ban';
  return 'pick';
}

// Retorna uma descrição legível da fase atual
export function getPhaseDescription(phase: DraftPhase): string {
  if (phase === 'setup') return 'Configuração';
  if (phase === 'completed') return 'Draft finalizado';
  
  const team = phase.includes('team1') ? 'Time 1' : 'Time 2';
  const action = phase.startsWith('ban') ? 'Banimento' : 'Escolha';
  
  const number = parseInt(phase.match(/\d+/)?.[0] || '1');
  
  return `${action} ${number} - ${team}`;
}