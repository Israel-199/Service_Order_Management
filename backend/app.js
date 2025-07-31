const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const apiRouter = require('./routes/api');
const authRoutes = require('./routes/authRoutes');

const app = express();
// Enable JSON body parsing
app.use(express.json());

app.use(cors());
app.use('/api', apiRouter);
app.use('/api', authRoutes);
app.use(errorHandler);
module.exports = app;