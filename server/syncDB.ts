/**
 * Database Sync Script
 * 
 * In development: use sequelize.sync({ alter: true }) to auto-update schema.
 * In production: use migrations instead (sequelize-cli).
 */

import { sequelize } from './models';

(async () => {
  try {
    await sequelize.sync({ alter: true }); // use force: true only if you want to drop & recreate tables
    console.log('✅ Database synced successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error syncing the database:', err);
    process.exit(1);
  }
})();
