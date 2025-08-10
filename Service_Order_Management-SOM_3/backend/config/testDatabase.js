
const sequelize = require("../database")

/**
 * Initialize and test database connection.
 * This will be used during server startup.
 */
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1); // Stop the app if DB connection fails
  }
}

module.exports = {
  sequelize,
  initializeDatabase,
};
