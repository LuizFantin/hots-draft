// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Heroes of the Storm Draft</h1>
        
        <p className="text-gray-300 mb-8 text-center">
          Sistema de draft para partidas competitivas de Heroes of the Storm
        </p>
        
        <div className="flex flex-col space-y-4">
          <Link 
            href="/draft/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md text-center font-medium transition-colors"
          >
            Iniciar Novo Draft
          </Link>
          
          <div className="text-center text-sm text-gray-400 mt-4">
            Versão 1.0 - Desenvolvido por ForeverSad para partidas competitivas
          </div>
        </div>
      </div>
    </div>
  );
}