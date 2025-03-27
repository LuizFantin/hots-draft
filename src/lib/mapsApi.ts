import { Map } from "./types";

let mapsCache: Map[] | null = null;

export async function fetchMaps(): Promise<Map[]> {

    if (mapsCache) {
        return mapsCache;
    }

    try {
      const response = await fetch('https://api.heroesprofile.com/openApi/Maps');
      const maps = await response.json();
      
    //   // Filter only playable ranked standard maps
    //   const filteredMaps =  maps.filter((map: Map) => 
    //     map.type === "standard" && map.playable === 1 && map.ranked_rotation === 1
    //   );

    // Transformar os dados da API para o formato que esperamos
      const mapsTransformed: Map[] = Object.keys(maps).map(key => {
        const map = maps[key];
        return {
            id: String(map.map_id),
            name: map.name,
            short_name: map.short_name,
            type: map.type,
            ranked_rotation: map.ranked_rotation,
            playable: map.playable,
            image_url: `/maps_icons/${(map.short_name).replace(/\s+/g, "")}.png` // URL das imagens
        };
      }).filter((map: Map) => 
            map.type === "standard" && map.playable === 1 && map.ranked_rotation === 1
      );

      mapsCache = mapsTransformed;

      return mapsTransformed;

    } catch (error) {
      console.error('Error fetching maps:', error);
      return [];
    }
  }