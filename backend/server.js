require('dotenv').config();
const http = require('http');
const app = require('./app');
const sequelize = require('./database');
const port = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});