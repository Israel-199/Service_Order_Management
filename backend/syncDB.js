/**
 * If you change your model definitions and want those changes to be reflected in your database, you have two primary approaches:
 * 
Using Migrations: This is the recommended approach for production. Tools like Sequelize CLI let you create migration files that capture the changes (e.g., altering columns, adding relationships) and then apply them using commands (e.g., "sequelize db:migrate"). This way you control every change without relying on automatic syncing.
Using sequelize.sync({ alter: true }): In development, you can use this option to automatically alter tables to match your model definitions. However, it isn’t recommended for production, as it might result in unintended data loss or schema issues.
 */


const { sequelize } = require('./models'); // This imports the sequelize instance from models/index.js

(async () => {
    try {
        // Use { alter: true } to adjust tables or { force: true } to drop and recreate (be careful with force)
        await sequelize.sync({ alter: true });
        console.log("Database synced successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error syncing the database:", err);
        process.exit(1);
    }
})();