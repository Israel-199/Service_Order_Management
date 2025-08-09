require('dotenv').config();
import http from 'http';

import app from './app';  // Use ES import here
import sequelize from './config/database'; // assuming you have default export
//const sequelize = require('./config/database').default; // Import your configured Sequelize instance

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Test DB connection
sequelize.authenticate()
  .then(() => console.log('✅ Database connected'))
  .catch((err: Error) => console.error('❌ Database connection error:', err));

// Start HTTP server
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
