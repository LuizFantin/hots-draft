import { DraftPhase } from '@/lib/types';

interface DraftPhaseIndicatorProps {
  phase: DraftPhase;
  description: string;
  isYourTurn: boolean;
}

export default function DraftPhaseIndicator({ 
  phase, 
  description, 
  isYourTurn 
}: DraftPhaseIndicatorProps) {
  let backgroundColor = 'bg-gray-700';
  
  if (phase === 'completed') {
    backgroundColor = 'bg-green-700';
  } else if (phase.startsWith('ban') || phase.startsWith('map_ban')) {
    backgroundColor = 'bg-red-700';
  } else if (phase.startsWith('pick') || phase === 'map_pick') {
    backgroundColor = 'bg-blue-700';
  }
  
  return (
    <div className={`mb-4 p-3 rounded-md ${backgroundColor} flex justify-between items-center`}>
      <div>
        <h2 className="text-lg font-semibold">{description}</h2>
        {phase !== 'setup' && phase !== 'completed' && (
          <p className="text-sm opacity-80">
            {phase.startsWith('ban') || phase.startsWith('map_ban') 
              ? 'Fase de Banimento' 
              : 'Fase de Escolha'}
          </p>
        )}
      </div>
      
      {isYourTurn && phase !== 'setup' && phase !== 'completed' && (
        <div className="bg-yellow-500 text-black font-bold py-1 px-3 rounded-md text-sm animate-pulse">
          Sua vez!
        </div>
      )}
    </div>
  );
}