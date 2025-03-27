'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [captainName, setCaptainName] = useState('');
  const [banCount, setBanCount] = useState(3);
  const [firstPickTeam, setFirstPickTeam] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  
  const handleCreateDraft = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    if (!captainName.trim()) {
      setError('Nome do capitão é obrigatório');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          captain1_name: captainName,
          ban_count: banCount,
          first_pick_team: firstPickTeam,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar draft');
      }
      
      // Marcar este usuário como o criador do draft e como time 1
      localStorage.setItem(`draft_${data.draft.id}_creator`, 'true');
      localStorage.setItem(`draft_${data.draft.id}_team`, '1');
      
      // Redirecionar para a página do draft
      router.push(`/draft/${data.draft.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Heroes of the Storm Draft</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleCreateDraft} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Seu Nome (Capitão 1)</label>
            <input
              type="text"
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seu nome"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-1">Banimentos por Time</label>
            <select
              value={banCount}
              onChange={(e) => setBanCount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>3 (Padrão)</option>
              <option value={4}>4</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-1">First Pick de Heróis</label>
            <select
              value={firstPickTeam}
              onChange={(e) => setFirstPickTeam(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Time 1</option>
              <option value={2}>Time 2</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar Draft'}
          </button>
        </form>
      </div>
    </div>
  );
}