require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initializeDatabase } = require('./config/testDatabase');

const port = process.env.PORT || 3000;

(async () => {
  try {
    await initializeDatabase(); 
    
    const server = http.createServer(app);
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server due to DB error:', err.message);
    process.exit(1);
  }
})();
