import express from 'express';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import usageRoutes from './routes/usageRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import cors from 'cors';

const app = express();


app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/usage', usageRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

