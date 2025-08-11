require('dotenv').config();
import { Sequelize, Dialect } from 'sequelize';

// Validate and assign environment variables
const DB_NAME = process.env.DB_NAME as string;
const DB_USER = process.env.DB_USER as string;
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST as string;
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);

// Explicitly type the dialect using Sequelize's Dialect type
const DB_DIALECT: Dialect = (process.env.DB_DIALECT as Dialect) || 'mysql';

if (!DB_NAME || !DB_USER || !DB_HOST) {
  throw new Error('Missing essential database environment variables (DB_NAME, DB_USER, DB_HOST)');
}

// Initialize Sequelize instance
const sequelize: Sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: false,
});

export default sequelize;
