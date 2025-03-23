import { initializeDatabase } from "@/lib/db";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

(async () => {
  try {
    // Chama a função para inicializar o banco de dados
    await initializeDatabase();
    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
})();

export default nextConfig;
