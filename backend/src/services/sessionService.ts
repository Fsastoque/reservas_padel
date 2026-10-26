import crypto from 'crypto';
import { db } from '../config/db';
import { env } from '../config/env';
import type { User } from '../types';
import { mapUser, type UserRow } from '../utils/mappers';

interface SessionRow extends UserRow {
  expires_at: string;
}

const sessionTtlMs = env.sessionTtlDays * 24 * 60 * 60 * 1000;

export const createSession = (userId: number): string => {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + sessionTtlMs).toISOString();

  db.prepare('INSERT INTO sesiones (id, user_id, data, expires_at) VALUES (?, ?, ?, ?)').run(
    sessionId,
    userId,
    null,
    expiresAt,
  );

  return sessionId;
};

export const deleteSession = (sessionId: string): void => {
  db.prepare('DELETE FROM sesiones WHERE id = ?').run(sessionId);
};

export const deleteExpiredSessions = (): void => {
  db.prepare('DELETE FROM sesiones WHERE expires_at <= ?').run(new Date().toISOString());
};

export const findUserBySession = (sessionId: string): User | null => {
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.created_at, s.expires_at
       FROM sesiones s
       JOIN usuarios u ON u.id = s.user_id
       WHERE s.id = ?`,
    )
    .get(sessionId) as SessionRow | undefined;

  if (!row) return null;

  if (row.expires_at <= new Date().toISOString()) {
    deleteSession(sessionId);
    return null;
  }

  return mapUser(row);
};
