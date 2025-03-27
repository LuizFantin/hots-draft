import { Map } from '@/lib/types';
import Image from 'next/image';

interface MapsListProps {
  maps: Map[];
  onSelect: (mapId: string) => void;
  isSelectable: boolean;
  isSelected: (mapId: string) => boolean;
  currentPhase: 'map_ban' | 'map_pick' | 'setup' | 'completed' | 'ban' | 'pick';
}

export default function MapsList({ maps, onSelect, isSelectable, isSelected, currentPhase }: MapsListProps) {
  const handleSelect = (mapId: string) => {
    if (isSelectable && !isSelected(mapId)) {
      onSelect(mapId);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {maps.map((map) => {
        const isBanned = isSelected(map.id);
        
        return (
          <div
            key={map.id}
            className={`relative rounded-lg overflow-hidden transition-all ${
              isSelectable && !isBanned
                ? 'hover:ring-2 hover:ring-blue-500 transform hover:scale-105 cursor-pointer'
                : isBanned ? 'cursor-not-allowed' : 'cursor-default'
            }`}
            onClick={() => handleSelect(map.id)}
          >
            <div className="aspect-video bg-gray-700 relative">
              {map.image_url ? (
                <div className="w-full h-full relative">
                  <Image
                    src={map.image_url}
                    alt={map.name}
                    layout="fill"
                    objectFit="cover"
                    className={`rounded-t-lg ${isBanned ? 'opacity-40 grayscale' : ''}`}
                  />
                  {isBanned && (
                    <div className="absolute inset-0 flex items-center justify-center bg-opacity-50">
                      <span className="text-white font-bold text-lg">
                        {currentPhase === 'map_ban' || currentPhase.startsWith('map_ban') ? 'BANIDO' : 'ESCOLHIDO'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>
            <div className="p-2 bg-gray-800">
              <h3 className="text-sm font-medium truncate">{map.name}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}