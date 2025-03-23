// src/lib/types.ts
export interface Hero {
    id: string;
    name: string;
    role: string;
    new_role: string;
    icon: string;
    short_name: string;
  }
  
  export type DraftStatus = 'waiting' | 'active' | 'completed';
  
  export type DraftPhase = 
    'setup' | 
    'ban1_team1' | 'ban1_team2' | 
    'ban2_team1' | 'ban2_team2' | 
    'ban3_team1' | 'ban3_team2' | 
    'ban4_team1' | 'ban4_team2' | 
    'pick1_team1' | 
    'pick1_team2' | 'pick2_team2' | 
    'pick2_team1' | 
    'ban5_team1' | 'ban5_team2' | 
    'pick3_team2' | 'pick4_team2' | 
    'pick3_team1' | 'pick4_team1' | 
    'pick5_team2' | 'pick5_team1' |
    'completed';
  
  export interface Draft {
    id: number;
    captain1_name: string;
    captain2_name: string | null;
    ban_count: number;
    status: DraftStatus;
    current_phase: DraftPhase;
    created_at: string;
    updated_at: string;
    picks: Pick[];
    bans: Ban[];
  }
  
  export interface Pick {
    id: number;
    draft_id: number;
    team: 1 | 2;
    hero_id: string;
    pick_order: number;
    created_at: string;
  }
  
  export interface Ban {
    id: number;
    draft_id: number;
    team: 1 | 2;
    hero_id: string;
    ban_order: number;
    created_at: string;
  }