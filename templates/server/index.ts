import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDB } from './db';
import sampleRouter from './routes/sampleRouter';
import loginRouter from './routes/loginRouter';
import { EXPRESS_PORT, HOSTED_ON } from './envConfig';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { logger, pinoMiddleware, requestContextLogsMiddleware } from './core/logger';
import { IncomingMessage, ServerResponse } from 'http';

const app = express();
const port = EXPRESS_PORT;

// Connect to DB
connectDB();

// Add pinoHttpMiddleware to log all HTTP requests.
app.use((req: IncomingMessage, res: ServerResponse, next: express.NextFunction) => {
  pinoMiddleware(req, res);
  next();
});

// Add contextMiddleware to have requestIds on all logs.
app.use(requestContextLogsMiddleware);

// Middlewares
const whitelist = [`http://localhost:${port}`, `https://${HOSTED_ON}`];
app.use(
  cors({
    origin: whitelist,
    methods: ['GET', 'PUT', 'POST', 'OPTIONS', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    credentials: true,
    maxAge: 86400, // 24h
    exposedHeaders: ['*', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Routes
logger.info('Registering routes...');
app.use('/', sampleRouter);
app.use('/', loginRouter);

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
