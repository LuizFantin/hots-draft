// src/app/draft/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Draft, Hero } from '@/lib/types';
import { getCurrentTeam, isPhaseType, getPhaseDescription } from '@/lib/draftLogic';
import DraftBoard from '@/components/DraftBoard';
import HeroesList from '@/components/HeroesList';
import ShareLink from '@/components/ShareLink';
import DraftPhaseIndicator from '@/components/DraftPhaseIndicator';

export default function DraftPage() {
  const params = useParams();
  const draftId = params.id as string;
  
  const [draft, setDraft] = useState<Draft | null>(null);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [currentUserTeam, setCurrentUserTeam] = useState<1 | 2 | null>(null);
  
  // Carregar dados do draft e heróis
  useEffect(() => {
    const fetchDraftData = async () => {
      try {
        // Buscar dados do draft
        const draftResponse = await fetch(`/api/${draftId}`);
        if (!draftResponse.ok) {
          throw new Error('Erro ao carregar o draft');
        }
        const draftData = await draftResponse.json();
        setDraft(draftData.draft);
        
        // Buscar lista de heróis
        const heroesResponse = await fetch('/api/heroes');
        if (!heroesResponse.ok) {
          throw new Error('Erro ao carregar heróis');
        }
        const heroesData = await heroesResponse.json();
        setHeroes(heroesData.heroes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDraftData();
    
    // Configurar polling para atualizações
    const intervalId = setInterval(fetchDraftData, 3000);
    
    return () => clearInterval(intervalId);
  }, [draftId]);
  
  // Função para entrar no draft como segundo capitão
  const joinAsCaptain2 = async () => {
    if (!captainName.trim()) {
      setError('Nome do capitão é obrigatório');
      return;
    }
    
    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draft_id: draftId,
          captain2_name: captainName,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao entrar no draft');
      }
      
      // Atualizar state
      setCurrentUserTeam(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
    }
  };
  
  // Função para iniciar o draft
  const startDraft = async () => {
    try {
      const response = await fetch('/api/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draft_id: draftId,
          action: 'start',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao iniciar o draft');
      }
      
      // Atualizar state
      setDraft(data.draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
    }
  };
  
  const selectHero = async (heroId: string) => {
    if (!draft) return;
    
    const phaseType = isPhaseType(draft.current_phase);
    if (phaseType !== 'ban' && phaseType !== 'pick') return;
    
    const currentTeam = getCurrentTeam(draft.current_phase);
    if (currentTeam !== currentUserTeam) {
      setError('Não é sua vez de escolher');
      return;
    }
    
    try {
      const response = await fetch('/api/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draft_id: draftId,
          action: phaseType,
          hero_id: heroId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao selecionar herói');
      }
      
      // Atualizar state
      setDraft(data.draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
    }
  };
  
  // Função para identificar heróis já escolhidos ou banidos
  const isHeroSelected = (heroId: string) => {
    if (!draft) return false;
    
    const pickedHeroes = draft.picks?.map(pick => pick.hero_id) || [];
    const bannedHeroes = draft.bans?.map(ban => ban.hero_id) || [];
    
    return pickedHeroes.includes(heroId) || bannedHeroes.includes(heroId);
  };
  
  // Renderizar estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }
  
  // Renderizar erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-500 text-white p-4 rounded-md max-w-md">
          <h2 className="text-xl font-bold mb-2">Erro</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // Renderizar draft não encontrado
  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-500 text-white p-4 rounded-md max-w-md">
          <h2 className="text-xl font-bold mb-2">Draft não encontrado</h2>
          <p>O draft solicitado não existe ou foi removido.</p>
        </div>
      </div>
    );
  }
  
  // Renderizar estado de setup (aguardando segundo capitão)
  if (draft.status === 'waiting' && !draft.captain2_name && !currentUserTeam) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Entrar no Draft</h1>
          
          <div className="mb-6">
            <p className="text-gray-300 mb-2">Draft criado por: <span className="font-semibold">{draft.captain1_name}</span></p>
            <p className="text-gray-300">Banimentos por time: <span className="font-semibold">{draft.ban_count}</span></p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seu nome (Capitão 2)"
              required
            />
            
            <button
              onClick={joinAsCaptain2}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Entrar como Capitão 2
            </button>
          </div>
          
          <div className="mt-6">
            <ShareLink
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title="Compartilhe este link com o outro capitão:"
            />
          </div>
        </div>
      </div>
    );
  }
  
  // Se o usuário é o capitão 1
  if (!currentUserTeam && draft.captain1_name) {
    setCurrentUserTeam(1);
  }
  
  // Se o usuário é o capitão 2
  if (!currentUserTeam && draft.captain2_name && captainName === draft.captain2_name) {
    setCurrentUserTeam(2);
  }
  
  // Renderizar estado de aguardando início
  if (draft.status === 'waiting' && draft.captain2_name && currentUserTeam === 1) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Draft Pronto</h1>
          
          <div className="mb-6">
            <p className="text-gray-300 mb-2">Capitão 1: <span className="font-semibold">{draft.captain1_name}</span></p>
            <p className="text-gray-300 mb-2">Capitão 2: <span className="font-semibold">{draft.captain2_name}</span></p>
            <p className="text-gray-300">Banimentos por time: <span className="font-semibold">{draft.ban_count}</span></p>
          </div>
          
          <button
            onClick={startDraft}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            Iniciar Draft
          </button>
        </div>
      </div>
    );
  }
  
  // Renderizar draft em andamento ou concluído
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-2xl font-bold">Heroes of the Storm Draft</h1>
          
          <div className="mt-2 md:mt-0 text-sm text-gray-300">
            <p>Capitão 1: <span className="font-semibold">{draft.captain1_name}</span></p>
            <p>Capitão 2: <span className="font-semibold">{draft.captain2_name}</span></p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg p-4">
            <DraftPhaseIndicator 
              phase={draft.current_phase} 
              description={getPhaseDescription(draft.current_phase)}
              isYourTurn={getCurrentTeam(draft.current_phase) === currentUserTeam}
            />
            
            <DraftBoard 
              draft={draft} 
              heroes={heroes}
              team1Name={draft.captain1_name}
              team2Name={draft.captain2_name || 'Time 2'}
            />
          </div>
          
          <div className="bg-gray-800 w-full rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-bold mb-4">
              {isPhaseType(draft.current_phase) === 'ban' ? 'Banir Herói' : 
                isPhaseType(draft.current_phase) === 'pick' ? 'Escolher Herói' : 
                'Lista de Heróis'}
            </h2>
            
            <HeroesList 
              heroes={heroes}
              onSelect={selectHero}
              isSelectable={getCurrentTeam(draft.current_phase) === currentUserTeam && 
                          (isPhaseType(draft.current_phase) === 'ban' || 
                            isPhaseType(draft.current_phase) === 'pick')}
              isSelected={isHeroSelected}
              currentPhase={isPhaseType(draft.current_phase)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}