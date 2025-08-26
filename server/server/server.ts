import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import express from 'express';
//import { Sequelize } from 'sequelize';
import sequelize from './config/database'; // assuming you have default export
import app from './app';  // Use ES import here

// Express App Setup
//const app = express();
const PORT = process.env.PORT || 3000;


// Main Endpoint
app.get('/', (req, res) => {
  res.send('Service Order Management API');
});

// Error Handling Middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Server Setup with Graceful Shutdown
async function onSignal() {
  console.log('Server is starting cleanup');
  await sequelize.close();
  console.log('Database connection closed');
}

const server = http.createServer(app);

// Start Server
(async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();

// Export for testing
export { server };