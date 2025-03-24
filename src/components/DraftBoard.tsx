import { Draft, Hero } from '@/lib/types';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface DraftBoardProps {
  draft: Draft;
  heroes: Hero[];
  team1Name: string;
  team2Name: string;
}

export default function DraftBoard({ draft, heroes, team1Name, team2Name }: DraftBoardProps) {
  const [team1Picks, setTeam1Picks] = useState<Hero[]>([]);
  const [team2Picks, setTeam2Picks] = useState<Hero[]>([]);
  const [team1Bans, setTeam1Bans] = useState<Hero[]>([]);
  const [team2Bans, setTeam2Bans] = useState<Hero[]>([]);
  
  // Processar picks e bans quando o draft mudar
  useEffect(() => {
    const processPicks = async () => {
      if (!draft.picks) return;
      
      const team1 = [];
      const team2 = [];
      
      for (const pick of draft.picks) {
        const hero = heroes.find(h => h.id === pick.hero_id);
        if (hero) {
          if (pick.team === 1) {
            team1.push(hero);
          } else {
            team2.push(hero);
          }
        }
      }
      
      setTeam1Picks(team1);
      setTeam2Picks(team2);
    };
    
    const processBans = async () => {
      if (!draft.bans) return;
      
      const team1 = [];
      const team2 = [];
      
      for (const ban of draft.bans) {
        const hero = heroes.find(h => h.id === ban.hero_id);
        if (hero) {
          if (ban.team === 1) {
            team1.push(hero);
          } else {
            team2.push(hero);
          }
        }
      }
      
      setTeam1Bans(team1);
      setTeam2Bans(team2);
    };
    
    processPicks();
    processBans();
  }, [draft, heroes]);
  
  // Renderizar slot de pick vazio ou com herói
  const renderPickSlot = (hero: Hero | null, index: number) => {
    return (
      <div 
        key={`pick-${index}`}
        className={`h-full w-full rounded-md flex items-center justify-center ${
          hero ? 'bg-gray-700' : 'bg-gray-700 bg-opacity-30 border border-dashed border-gray-600'
        }`}
      >
        {hero ? (
          <div className="flex flex-col items-center p-1">
            <Image 
              src={hero.icon}
              alt={hero.name} 
              width={70}
              height={70}
              quality={100}
              className="h-full w-full object-cover rounded-md"
            />
            <span className="text-xs mt-1 truncate w-full text-center">{hero.name}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-500">Pick {index + 1}</span>
        )}
      </div>
    );
  };
  
  // Renderizar slot de ban vazio ou com herói
  const renderBanSlot = (hero: Hero | null, index: number) => {
    return (
      <div 
        key={`ban-${index}`}
        className={`h-20 w-20 rounded-md flex items-center justify-center relative ${
          hero ? 'bg-gray-700' : 'bg-gray-700 bg-opacity-30 border border-dashed border-gray-600'
        }`}
      >
        {hero ? (
          <div className="aspect-square relative">
            <Image 
              src={hero.icon}
              alt={hero.name} 
              width={70}
              height={70}
              quality={100}
              className="h-full w-full object-cover rounded-md opacity-50"
            />
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500 transform rotate-45"></div>
              <div className="w-full h-0.5 bg-red-500 transform -rotate-45"></div>
            </div> */}
            <div className="absolute bottom-0 left-0 right-0 text-xs text-center truncate bg-black bg-opacity-50 rounded-b-md">
              {hero.name}
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-500">Ban {index + 1}</span>
        )}
      </div>
    );
  };
  
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Time 1 */}
      <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">{team1Name}</h3>
        
        {/* Bans do Time 1 */}
        <div className="mb-4">
          <h4 className="text-sm text-gray-300 mb-2">Banimentos</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: draft.ban_count }).map((_, i) => (
              renderBanSlot(team1Bans[i] || null, i)
            ))}
          </div>
        </div>
        
        {/* Picks do Time 1 */}
        <div>
          <h4 className="text-sm text-gray-300 mb-2">Picks</h4>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              renderPickSlot(team1Picks[i] || null, i)
            ))}
          </div>
        </div>
      </div>
      
      {/* Time 2 */}
      <div className="bg-red-900 bg-opacity-20 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-400 mb-2">{team2Name}</h3>
        
        {/* Bans do Time 2 */}
        <div className="mb-4">
          <h4 className="text-sm text-gray-300 mb-2">Banimentos</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: draft.ban_count }).map((_, i) => (
              renderBanSlot(team2Bans[i] || null, i)
            ))}
          </div>
        </div>
        
        {/* Picks do Time 2 */}
        <div>
          <h4 className="text-sm text-gray-300 mb-2">Picks</h4>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              renderPickSlot(team2Picks[i] || null, i)
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}