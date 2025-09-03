// server/db/db.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@shared/schema'; // adjust if schema path is different
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle with the pool and schema
export const db = drizzle(pool, { schema });

// (Optional) Export the pool if you ever need raw SQL queries
export { pool };
