import { Draft, Map, MapBan } from '@/lib/types';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface MapDraftBoardProps {
  draft: Draft;
  maps: Map[];
  team1Name: string;
  team2Name: string;
}

export default function MapDraftBoard({ draft, maps, team1Name, team2Name }: MapDraftBoardProps) {
  const [team1Bans, setTeam1Bans] = useState<Map[]>([]);
  const [team2Bans, setTeam2Bans] = useState<Map[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const [lastBannedMap, setLastBannedMap] = useState<{mapId: string, team: 1 | 2} | null>(null);
  
  // Processar bans e mapa selecionado quando o draft mudar
  useEffect(() => {
    const processBans = async () => {
      if (!draft.map_bans) return;
      
      const team1 = [];
      const team2 = [];
      
      // Encontrar o último mapa banido
      let lastBan: MapBan | null = null;
      
      for (const ban of draft.map_bans) {
        const map = maps.find(m => m.id == ban.map_id);
        if (map) {
          if (ban.team === 1) {
            team1.push(map);
          } else {
            team2.push(map);
          }
        }
        
        // Atualizar o último ban se este for mais recente
        if (!lastBan || new Date(ban.created_at) > new Date(lastBan.created_at)) {
          lastBan = ban;
        }
      }
      
      setTeam1Bans(team1);
      setTeam2Bans(team2);
      
      // Definir o último mapa banido
      if (lastBan) {
        setLastBannedMap({
          mapId: lastBan.map_id,
          team: lastBan.team
        });
      } else {
        setLastBannedMap(null);
      }
    };
    
    const processSelectedMap = async () => {
      if (!draft.selected_map) return;
      
      const map = maps.find(m => m.id == draft.selected_map);
      if (map) {
        setSelectedMap(map);
      }
    };
    
    processBans();
    processSelectedMap();
  }, [draft, maps]);
  
  // Função para verificar se um mapa é o último banido
  const isLastBannedMap = (mapId: string, team: 1 | 2) => {
    return lastBannedMap && lastBannedMap.mapId === mapId && lastBannedMap.team === team;
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time 1 */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-400">{team1Name} - Mapas Banidos</h3>
          <div className="grid grid-cols-2 gap-3">
            {team1Bans.map((map) => (
              <div key={map.id} className={`bg-gray-700 rounded-lg overflow-hidden ${isLastBannedMap(map.id, 1) ? 'ring-2 ring-yellow-500' : ''}`}>
                <div className="aspect-video relative">
                  {map.image_url ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={map.image_url}
                        alt={map.name}
                        layout="fill"
                        objectFit="cover"
                        className="opacity-40"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center ${isLastBannedMap(map.id, 1) ? 'bg-opacity-70' : 'bg-opacity-50'}`}>
                        <span className="text-white font-bold text-lg">BANIDO</span>
                        {isLastBannedMap(map.id, 1) && (
                          <span className="absolute top-1 right-1 bg-yellow-500 text-black text-xs px-1 rounded animate-pulse">
                            Novo
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h4 className="text-sm font-medium truncate">{map.name}</h4>
                </div>
              </div>
            ))}
            {team1Bans.length === 0 && (
              <div className="text-gray-400 col-span-2">Nenhum mapa banido</div>
            )}
          </div>
        </div>
        
        {/* Time 2 */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-red-400">{team2Name} - Mapas Banidos</h3>
          <div className="grid grid-cols-2 gap-3">
            {team2Bans.map((map) => (
              <div key={map.id} className={`bg-gray-700 rounded-lg overflow-hidden ${isLastBannedMap(map.id, 2) ? 'ring-2 ring-yellow-500' : ''}`}>
                <div className="aspect-video relative">
                  {map.image_url ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={map.image_url}
                        alt={map.name}
                        layout="fill"
                        objectFit="cover"
                        className="opacity-40"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center ${isLastBannedMap(map.id, 2) ? 'bg-opacity-70' : 'bg-opacity-50'}`}>
                        <span className="text-white font-bold text-lg">BANIDO</span>
                        {isLastBannedMap(map.id, 2) && (
                          <span className="absolute top-1 right-1 bg-yellow-500 text-black text-xs px-1 rounded animate-pulse">
                            Novo
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h4 className="text-sm font-medium truncate">{map.name}</h4>
                </div>
              </div>
            ))}
            {team2Bans.length === 0 && (
              <div className="text-gray-400 col-span-2">Nenhum mapa banido</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mapa Selecionado */}
      {selectedMap && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-green-400">Mapa Selecionado</h3>
          <div className="bg-gray-700 rounded-lg overflow-hidden max-w-md mx-auto">
            <div className="aspect-video relative">
              {selectedMap.image_url ? (
                <div className="w-full h-full relative">
                  <Image
                    src={selectedMap.image_url}
                    alt={selectedMap.name}
                    layout="fill"
                    objectFit="cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-green-900 bg-opacity-40">
                    <span className="text-white font-bold text-xl">ESCOLHIDO</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>
            <div className="p-3 text-center">
              <h4 className="text-lg font-medium">{selectedMap.name}</h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}