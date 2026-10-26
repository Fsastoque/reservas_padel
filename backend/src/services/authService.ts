import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import type { User } from '../types';
import { isUniqueConstraintError } from '../utils/dbErrors';
import { httpError } from '../utils/httpError';
import { mapUser, type UserRow } from '../utils/mappers';

interface AuthRow extends UserRow {
  password_hash: string;
}

interface RegistrationInput {
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
}

const dummyHash = bcrypt.hashSync('contrasena-de-relleno', 10);

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getUserById = (id: number): User | null => {
  const row = db.prepare('SELECT id, email, created_at FROM usuarios WHERE id = ?').get(id) as
    | UserRow
    | undefined;

  return row ? mapUser(row) : null;
};

const findAuthRowByEmail = (email: string): AuthRow | undefined =>
  db
    .prepare('SELECT id, email, password_hash, created_at FROM usuarios WHERE email = ?')
    .get(email) as AuthRow | undefined;

export const registerUser = (input: RegistrationInput): User => {
  const email = normalizeEmail(typeof input.email === 'string' ? input.email : '');
  const password = typeof input.password === 'string' ? input.password : '';
  const confirmPassword = typeof input.confirmPassword === 'string' ? input.confirmPassword : '';

  if (!email) throw httpError(400, 'Ingresa tu correo electrónico.');
  if (!isValidEmail(email)) throw httpError(400, 'Ingresa un correo electrónico válido.');
  if (password.length < 8) {
    throw httpError(400, 'La contraseña debe tener al menos 8 caracteres.');
  }
  if (password !== confirmPassword) throw httpError(400, 'Las contraseñas no coinciden.');

  if (findAuthRowByEmail(email)) {
    throw httpError(409, 'Ese correo ya está registrado. Inicia sesión con tu cuenta.');
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const result = db
      .prepare('INSERT INTO usuarios (email, password_hash) VALUES (?, ?)')
      .run(email, passwordHash);

    const user = getUserById(Number(result.lastInsertRowid));
    if (!user) throw httpError(500, 'No pudimos crear tu cuenta. Intenta de nuevo.');

    return user;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw httpError(409, 'Ese correo ya está registrado. Inicia sesión con tu cuenta.');
    }
    throw error;
  }
};

export const authenticateUser = (emailInput: unknown, passwordInput: unknown): User => {
  const email = normalizeEmail(typeof emailInput === 'string' ? emailInput : '');
  const password = typeof passwordInput === 'string' ? passwordInput : '';

  if (!email || !password) throw httpError(400, 'Ingresa tu correo y contraseña.');

  const row = findAuthRowByEmail(email);
  const passwordMatches = bcrypt.compareSync(password, row?.password_hash ?? dummyHash);

  if (!row || !passwordMatches) {
    throw httpError(401, 'Correo o contraseña incorrectos.');
  }

  return mapUser(row);
};
