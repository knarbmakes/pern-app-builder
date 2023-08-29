import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDB } from './db';
import sampleRouter from './routes/sampleRouter';
import loginRouter from './routes/loginRouter';
import { EXPRESS_PORT, HOSTED_ON } from './envConfig';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const port = EXPRESS_PORT;

// Connect to DB
connectDB();

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
app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api', sampleRouter);
app.use('/api', loginRouter);

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
