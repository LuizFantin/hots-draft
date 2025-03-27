'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Draft, Hero, Map } from '@/lib/types';
import { getCurrentTeam, isPhaseType, getPhaseDescription, getMapPickTeam } from '@/lib/draftLogic';
import DraftBoard from '@/components/DraftBoard';
import HeroesList from '@/components/HeroesList';
import MapsList from '@/components/MapsList';
import ShareLink from '@/components/ShareLink';
import DraftPhaseIndicator from '@/components/DraftPhaseIndicator';
import MapDraftBoard from '@/components/MapDraftBoard';
import Image from 'next/image';

export default function DraftPage() {
  const params = useParams();
  const draftId = params.id as string;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [currentUserTeam, setCurrentUserTeam] = useState<1 | 2 | null>(null);
  const [selectedMapDetails, setSelectedMapDetails] = useState<Map | null>(null);
  
  // Carregar dados do draft e heróis e mapas
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

        // Buscar lista de mapas
        const mapsResponse = await fetch('/api/maps');
        if (!mapsResponse.ok) {
          throw new Error('Erro ao carregar mapas');
        }
        const mapsData = await mapsResponse.json();
        setMaps(mapsData.maps);
        
        // Se tiver um mapa selecionado, buscar os detalhes dele
        if (draftData.draft.selected_map) {
          const selectedMap = mapsData.maps.find((m: Map) => m.id == draftData.draft.selected_map);
          if (selectedMap) {
            setSelectedMapDetails(selectedMap);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDraftData();
    
    // Configurar polling para atualizações
    const intervalId = setInterval(fetchDraftData, 1000);
    
    return () => clearInterval(intervalId);
  }, [draftId]);
  
  // Verificar localStorage para identificação do usuário
  useEffect(() => {
    if (typeof window !== 'undefined' && draft) {
      const storedTeam = localStorage.getItem(`draft_${draftId}_team`);
      
      if (storedTeam) {
        const team = parseInt(storedTeam) as 1 | 2;
        setCurrentUserTeam(team);
      } else if (draft.captain1_name && !draft.captain2_name) {
        // Se não tiver time definido no localStorage e o draft tem apenas capitão 1,
        // verificar se o usuário é o criador do draft
        const isCreator = localStorage.getItem(`draft_${draftId}_creator`) === 'true';
        if (isCreator) {
          setCurrentUserTeam(1);
          localStorage.setItem(`draft_${draftId}_team`, '1');
        }
      }
    }
  }, [draft, draftId]);
  
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
      
      // Salvar no localStorage
      localStorage.setItem(`draft_${draftId}_team`, '2');
      
      // Atualizar o draft
      setDraft(data.draft);
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
  
  // Função para selecionar herói
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
  
  // Função para selecionar mapa
  const selectMap = async (mapId: string) => {
    if (!draft) return;
    
    const phaseType = isPhaseType(draft.current_phase);
    if (phaseType !== 'map_ban' && phaseType !== 'map_pick') return;
    
    // Para map_pick, verificar se o usuário é do time que tem direito a escolher o mapa
    if (phaseType === 'map_pick') {
      const mapPickTeam = getMapPickTeam(draft);
      if (mapPickTeam !== currentUserTeam) {
        setError('Não é sua vez de escolher o mapa');
        return;
      }
    } else {
      // Para map_ban, verificar se é a vez do time do usuário
      const currentTeam = getCurrentTeam(draft.current_phase);
      if (currentTeam !== currentUserTeam) {
        setError('Não é sua vez de banir o mapa');
        return;
      }
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
          map_id: mapId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao selecionar mapa');
      }
      
      // Atualizar state
      setDraft(data.draft);
      
      // Se foi uma escolha de mapa, atualizar o mapa selecionado
      if (phaseType === 'map_pick') {
        const selectedMap = maps.find(m => m.id === mapId);
        if (selectedMap) {
          setSelectedMapDetails(selectedMap);
        }
      }
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
  
  // Função para identificar mapas já escolhidos ou banidos
  const isMapSelected = (mapId: string) => {
    if (!draft) return false;
    
    const bannedMaps = draft.map_bans?.map(ban => ban.map_id) || [];
    
    return bannedMaps.includes(mapId) || draft.selected_map == mapId;
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
          <button 
            onClick={() => setError('')} 
            className="mt-4 bg-white text-red-500 px-4 py-2 rounded-md font-medium"
          >
            Fechar
          </button>
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
  
  // Renderizar tela para entrar como capitão 2 (para novos usuários)
  if (!currentUserTeam && draft.status === 'waiting' && draft.captain1_name && !draft.captain2_name) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Entrar no Draft</h1>
          
          <div className="mb-6">
            <p className="text-gray-300 mb-2">Draft criado por: <span className="font-semibold">{draft.captain1_name}</span></p>
            <p className="text-gray-300 mb-2">Banimentos por time: <span className="font-semibold">{draft.ban_count}</span></p>
            <p className="text-gray-300">First Pick de Heróis: <span className="font-semibold">Time {draft.first_pick_team}</span></p>
            <p className="text-gray-300">Pick de Mapa: <span className="font-semibold">Time {draft.first_pick_team === 1 ? 2 : 1}</span></p>
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
        </div>
      </div>
    );
  }
  
  // Renderizar estado de compartilhamento (para o capitão 1 quando não há capitão 2)
  if (draft.status === 'waiting' && !draft.captain2_name && currentUserTeam === 1) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Compartilhe o Link</h1>
          
          <div className="mb-6">
            <p className="text-gray-300 mb-2">Draft criado por: <span className="font-semibold">{draft.captain1_name}</span></p>
            <p className="text-gray-300 mb-2">Banimentos por time: <span className="font-semibold">{draft.ban_count}</span></p>
            <p className="text-gray-300">First Pick de Heróis: <span className="font-semibold">Time {draft.first_pick_team}</span></p>
            <p className="text-gray-300">Pick de Mapa: <span className="font-semibold">Time {draft.first_pick_team === 1 ? 2 : 1}</span></p>
          </div>
          
          <div className="mt-6">
            <ShareLink
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title="Compartilhe este link com o outro capitão:"
            />
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-300">Aguardando o Capitão 2 entrar...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Renderizar estado de aguardando início (para o capitão 1)
  if (draft.status === 'waiting' && draft.captain2_name && currentUserTeam === 1) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Draft Pronto</h1>
          
          <div className="mb-6">
            <p className="text-gray-300 mb-2">Capitão 1: <span className="font-semibold">{draft.captain1_name}</span></p>
            <p className="text-gray-300 mb-2">Capitão 2: <span className="font-semibold">{draft.captain2_name}</span></p>
            <p className="text-gray-300 mb-2">Banimentos por time: <span className="font-semibold">{draft.ban_count}</span></p>
            <p className="text-gray-300 mb-2">First Pick de Heróis: <span className="font-semibold">Time {draft.first_pick_team}</span></p>
            <p className="text-gray-300">Pick de Mapa: <span className="font-semibold">Time {draft.first_pick_team === 1 ? 2 : 1}</span></p>
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
  
  // Renderizar estado de aguardando início (para o capitão 2)
  if (draft.status === 'waiting' && draft.captain2_name && currentUserTeam === 2) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Aguardando Início</h1>
          
          <div className="mb-6">
            <p className="text-gray-300 mb-2">Capitão 1: <span className="font-semibold">{draft.captain1_name}</span></p>
            <p className="text-gray-300 mb-2">Capitão 2: <span className="font-semibold">{draft.captain2_name}</span></p>
            <p className="text-gray-300 mb-2">Banimentos por time: <span className="font-semibold">{draft.ban_count}</span></p>
            <p className="text-gray-300 mb-2">First Pick de Heróis: <span className="font-semibold">Time {draft.first_pick_team}</span></p>
            <p className="text-gray-300">Pick de Mapa: <span className="font-semibold">Time {draft.first_pick_team === 1 ? 2 : 1}</span></p>
          </div>
          
          <div className="bg-blue-900 bg-opacity-50 p-4 rounded-md text-center">
            <p className="text-lg">Aguardando o Capitão 1 iniciar o draft...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Renderizar draft em andamento ou concluído
  return (
    <div className={`min-h-screen text-white p-4 relative ${selectedMapDetails ? 'bg-gray-900' : 'bg-gray-900'}`}>
      {/* Mapa como plano de fundo quando selecionado */}
      {selectedMapDetails && selectedMapDetails.image_url && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black opacity-70 z-10"></div>
          <Image
            src={selectedMapDetails.image_url}
            alt={selectedMapDetails.name}
            layout="fill"
            objectFit="cover"
            className="opacity-40"
          />
        </div>
      )}
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-2xl font-bold">Heroes of the Storm Draft</h1>
          
          <div className="mt-2 md:mt-0 text-sm text-gray-300">
            <p>Capitão 1: <span className="font-semibold">{draft.captain1_name}</span></p>
            <p>Capitão 2: <span className="font-semibold">{draft.captain2_name}</span></p>
            <p>Você é: <span className="font-semibold text-yellow-400">Time {currentUserTeam}</span></p>
            <p>First Pick de Heróis: <span className="font-semibold">Time {draft.first_pick_team}</span></p>
            {draft.selected_map && (
              <p>Mapa Selecionado: <span className="font-semibold">
                {maps.find(m => m.id == draft.selected_map)?.name || draft.selected_map}
              </span></p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div className="lg:col-span-2 bg-gray-800 bg-opacity-90 rounded-lg shadow-lg p-4">
            <DraftPhaseIndicator 
              phase={draft.current_phase} 
              description={getPhaseDescription(draft.current_phase)}
              isYourTurn={
                draft.current_phase === 'map_pick' 
                  ? getMapPickTeam(draft) === currentUserTeam
                  : getCurrentTeam(draft.current_phase) === currentUserTeam
              }
            />
            
            {/* Mostrar o draft board de mapas apenas se estamos na fase de draft de mapas e não temos um mapa selecionado */}
            {(draft.current_phase.startsWith('map_') && !draft.selected_map) && (
              <MapDraftBoard 
                draft={draft} 
                maps={maps}
                team1Name={draft.captain1_name}
                team2Name={draft.captain2_name || 'Time 2'}
              />
            )}

            {/* Mostrar o draft board de heróis se não estamos na fase de draft de mapas ou se já temos um mapa selecionado */}
            {(!draft.current_phase.startsWith('map_') || draft.selected_map) && (
              <DraftBoard 
                draft={draft} 
                heroes={heroes}
                team1Name={draft.captain1_name}
                team2Name={draft.captain2_name || 'Time 2'}
              />
            )}
          </div>
          
          <div className="bg-gray-800 bg-opacity-90 w-full rounded-lg shadow-lg p-4">
            {/* Mostrar a lista de mapas se estamos na fase de draft de mapas e não temos um mapa selecionado */}
            {draft.current_phase.startsWith('map_') && !draft.selected_map ? (
              <>
                <h2 className="text-xl font-bold mb-4">
                  {isPhaseType(draft.current_phase) === 'map_ban' ? 'Banir Mapa' : 
                    isPhaseType(draft.current_phase) === 'map_pick' ? 'Escolher Mapa' : 
                    'Lista de Mapas'}
                </h2>
                
                <MapsList 
                  maps={maps}
                  onSelect={selectMap}
                  isSelectable={
                    (draft.current_phase === 'map_pick' && getMapPickTeam(draft) === currentUserTeam) ||
                    (draft.current_phase.startsWith('map_ban') && getCurrentTeam(draft.current_phase) === currentUserTeam)
                  }
                  isSelected={isMapSelected}
                  currentPhase={isPhaseType(draft.current_phase)}
                />
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}