import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import './config/db';
import { attachUser } from './middlewares/auth';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import availabilityRoutes from './routes/availability';
import courtsRoutes from './routes/courts';
import reservationsRoutes from './routes/reservations';

export const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(attachUser);

app.use('/api/auth', authRoutes);
app.use('/api/courts', courtsRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reservations', reservationsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
