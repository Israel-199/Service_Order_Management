import { Sequelize } from 'sequelize';
import type { Dialect } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('✅ Environment variables loaded from:', path.resolve(__dirname, '../.env'));

// Validate and assign essential environment variables
const DB_NAME = process.env.DB_NAME as string;
const DB_USER = process.env.DB_USER as string;
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST as string;
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);

// Define allowed Sequelize dialects
const allowedDialects: Dialect[] = ['mysql', 'postgres', 'sqlite'];

// Read dialect from .env and validate it
const envDialect = process.env.DB_DIALECT as string | undefined;
const DB_DIALECT: Dialect = allowedDialects.includes(envDialect as Dialect)
  ? (envDialect as Dialect)
  : 'postgres'; // fallback default

console.log('📦 DB Config:', {
  DB_NAME,
  DB_USER,
  DB_HOST,
  DB_PORT,
  DB_DIALECT
});

// Check required env vars
if (!DB_NAME || !DB_USER || !DB_HOST) {
  throw new Error('Missing essential database environment variables (DB_NAME, DB_USER, DB_HOST)');
}

// Initialize Sequelize
const sequelize = new Sequelize({
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  dialectOptions: process.env.DB_SSL === 'true'
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : undefined,
  logging: console.log
});

// Test connection function
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection successful!');
  } catch (error) {
    console.error('❌ DB connection error:', error);
  }
}

export default sequelize;
