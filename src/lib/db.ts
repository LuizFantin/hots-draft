// src/lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// Inicialização do banco de dados
export async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS drafts (
      id SERIAL PRIMARY KEY,
      captain1_name TEXT NOT NULL,
      captain2_name TEXT,
      ban_count INTEGER NOT NULL DEFAULT 3,
      status TEXT NOT NULL DEFAULT 'waiting',
      current_phase TEXT NOT NULL DEFAULT 'setup',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS picks (
      id SERIAL PRIMARY KEY,
      draft_id INTEGER REFERENCES drafts(id) ON DELETE CASCADE,
      team INTEGER NOT NULL,
      hero_id TEXT NOT NULL,
      pick_order INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS bans (
      id SERIAL PRIMARY KEY,
      draft_id INTEGER REFERENCES drafts(id) ON DELETE CASCADE,
      team INTEGER NOT NULL,
      hero_id TEXT NOT NULL,
      ban_order INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}