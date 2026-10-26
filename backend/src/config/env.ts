import dotenv from 'dotenv';

dotenv.config();

const toPositiveNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  port: toPositiveNumber(process.env.PORT, 3000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  sessionTtlDays: toPositiveNumber(process.env.SESSION_TTL_DAYS, 365),
  isProduction: process.env.NODE_ENV === 'production',
};

export const sessionMaxAgeSeconds = env.sessionTtlDays * 24 * 60 * 60;
