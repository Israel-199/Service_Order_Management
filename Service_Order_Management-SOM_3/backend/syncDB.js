const { sequelize } = require('./models'); // Adjust path if models folder is elsewhere

(async () => {
    try {
        // This will create missing tables and update existing ones
        await sequelize.sync({ alter: true });
        console.log("✅ Database synced successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error syncing the database:", err);
        process.exit(1);
    }
})();
