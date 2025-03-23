// src/components/HeroesList.tsx
import { useState } from 'react';
import { Hero } from '@/lib/types';
import Image from 'next/image';


interface HeroesListProps {
  heroes: Hero[];
  onSelect: (heroId: string) => void;
  isSelectable: boolean;
  isSelected: (heroId: string) => boolean;
  currentPhase: 'ban' | 'pick' | 'setup' | 'completed';
}

export default function HeroesList({ 
  heroes, 
  onSelect, 
  isSelectable, 
  isSelected,
  currentPhase
}: HeroesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  
  // Filtrar heróis por termo de pesquisa e papel
  const filteredHeroes = heroes.filter(hero => {
    const matchesSearch = hero.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? hero.new_role === roleFilter : true;
    return matchesSearch && matchesRole;
  });
  
  // Agrupar papéis únicos para o filtro
  const uniqueRoles = Array.from(new Set(heroes.map(hero => hero.new_role))).sort();
  
  return (
    <div>
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Buscar herói..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRoleFilter(null)}
            className={`px-2 py-1 text-xs rounded-md ${
              roleFilter === null ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            Todos
          </button>
          
          {uniqueRoles.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-2 py-1 text-xs rounded-md ${
                roleFilter === role ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-96 overflow-y-auto pr-2 grid grid-cols-6 gap-2">
        {filteredHeroes.map(hero => {
          const isAlreadySelected = isSelected(hero.id);
          
          return (
            <button
              key={hero.id}
              onClick={() => !isAlreadySelected && isSelectable && onSelect(hero.id)}
              disabled={isAlreadySelected || !isSelectable}
              className={`p-1 rounded-md relative group ${
                isAlreadySelected 
                  ? 'bg-gray-700 opacity-40 cursor-not-allowed' 
                  : isSelectable 
                    ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer' 
                    : 'bg-gray-700 cursor-not-allowed'
              }`}
              title={hero.name}
            >
              <div className="aspect-square relative">
                <Image 
                  src={hero.icon}
                  alt={hero.name} 
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-md"
                />
                
                {isAlreadySelected && currentPhase === 'ban' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-red-500 transform rotate-45"></div>
                    <div className="w-full h-0.5 bg-red-500 transform -rotate-45"></div>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 py-0.5 text-center text-xs truncate">
                  {hero.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}