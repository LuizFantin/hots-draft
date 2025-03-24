import { Hero } from './types';

// Cache para armazenar os heróis
let heroesCache: Hero[] | null = null;

export async function fetchHeroes(): Promise<Hero[]> {
  // Se já tivermos os heróis em cache, retorne-os
  if (heroesCache) {
    return heroesCache;
  }

  try {
    const response = await fetch('https://api.heroesprofile.com/openApi/Heroes');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch heroes: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transformar os dados da API para o formato que esperamos
    const heroes: Hero[] = Object.keys(data).map(key => {
      const hero = data[key];
      return {
        id: key,
        name: hero.name,
        role: hero.role,
        new_role: hero.new_role,
        short_name: hero.short_name,
        icon: `/heroes_icons_quality/${hero.short_name}.png` // URL dos ícones
        // icon: `/heroes_icons/${hero.short_name}.webp` // URL dos ícones
      };
    });
    
    // Armazenar em cache
    heroesCache = heroes;
    
    return heroes;
  } catch (error) {
    console.error('Error fetching heroes:', error);
    return [];
  }
}

// Função para buscar um herói pelo ID
export async function getHeroById(id: string): Promise<Hero | undefined> {
  const heroes = await fetchHeroes();
  return heroes.find(hero => hero.id === id);
}