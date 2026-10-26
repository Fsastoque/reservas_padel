import { db } from '../config/db';
import type { Court } from '../types';

export const getCourts = (): Court[] =>
  db.prepare('SELECT id, name FROM canchas ORDER BY id').all() as Court[];

export const courtExists = (courtId: number): boolean =>
  Boolean(db.prepare('SELECT 1 FROM canchas WHERE id = ?').get(courtId));
