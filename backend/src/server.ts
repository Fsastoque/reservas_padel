import { app } from './app';
import { db } from './config/db';
import { env } from './config/env';
import { deleteExpiredSessions } from './services/sessionService';

deleteExpiredSessions();

const server = app.listen(env.port, () => {
  console.log(`API de reservas de pádel en http://localhost:${env.port}/api`);
});

const shutdown = (): void => {
  server.close(() => {
    db.close();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
