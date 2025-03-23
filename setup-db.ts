import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from 'ws';
import 'dotenv/config';
import { neonConfig } from '@neondatabase/serverless';

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

async function main() {
  console.log('Setting up database...');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  console.log('Database URL found:', process.env.DATABASE_URL ? 'Yes' : 'No');
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    
    // Create tables directly using SQL
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS ad_copies (
        id SERIAL PRIMARY KEY,
        product_name TEXT NOT NULL,
        brand_name TEXT NOT NULL,
        product_description TEXT NOT NULL,
        key_features TEXT,
        age_range TEXT,
        gender TEXT,
        interests TEXT,
        tone TEXT NOT NULL,
        platform TEXT NOT NULL,
        variations INTEGER DEFAULT 3,
        generated_copies TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    
    console.log('Database tables created successfully!');
    
    // Test the connection by querying the tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Available tables:', tables.rows.map(row => row.table_name));
    
    await pool.end();
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

main();
