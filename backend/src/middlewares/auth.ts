import type { NextFunction, Request, Response } from 'express';
import { findUserBySession } from '../services/sessionService';
import { parseCookies, SESSION_COOKIE_NAME } from '../utils/cookies';

export const attachUser = (req: Request, _res: Response, next: NextFunction): void => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies[SESSION_COOKIE_NAME];

  if (sessionId) {
    const user = findUserBySession(sessionId);
    if (user) {
      req.user = user;
      req.sessionId = sessionId;
    }
  }

  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Debes iniciar sesión para continuar.' });
    return;
  }

  next();
};
