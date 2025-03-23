// src/lib/startup.ts
import { initializeDatabase } from './db';

async function start() {
  try {
    await initializeDatabase(); // Chama a função para inicializar as tabelas
    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
}

start();
