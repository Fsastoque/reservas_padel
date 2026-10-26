import type { NextFunction, Request, Response } from 'express';
import { sessionMaxAgeSeconds } from '../config/env';
import { authenticateUser, registerUser } from '../services/authService';
import { createSession, deleteSession } from '../services/sessionService';
import { buildClearSessionCookie, buildSessionCookie } from '../utils/cookies';

export const register = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = registerUser(req.body ?? {});
    const sessionId = createSession(user.id);

    res.setHeader('Set-Cookie', buildSessionCookie(sessionId, sessionMaxAgeSeconds));
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const login = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = authenticateUser(req.body?.email, req.body?.password);
    const sessionId = createSession(user.id);

    res.setHeader('Set-Cookie', buildSessionCookie(sessionId, sessionMaxAgeSeconds));
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response): void => {
  if (req.sessionId) {
    deleteSession(req.sessionId);
  }

  res.setHeader('Set-Cookie', buildClearSessionCookie());
  res.status(200).json({ message: 'Sesión cerrada.' });
};

export const me = (req: Request, res: Response): void => {
  res.status(200).json({ user: req.user });
};
