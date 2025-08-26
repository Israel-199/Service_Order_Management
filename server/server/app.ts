import express, { Application } from 'express';
import cors from 'cors';
import apiRouter from './routes/api';
import errorHandler from './middleware/errorHandler';

const app: Application = express();

// Enable JSON body parsing
app.use(express.json());
app.use(cors());


app.get('/ping', (req, res) => res.json({ status: 'ok' }));


// Routes
app.use('/api', apiRouter);

// Global error handler
app.use(errorHandler);

export default app;
