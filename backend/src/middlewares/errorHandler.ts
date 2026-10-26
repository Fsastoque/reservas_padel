import type { NextFunction, Request, Response } from 'express';
import type { HttpError } from '../utils/httpError';

interface ParseError extends Error {
  type?: string;
}

const hasStatus = (error: unknown): error is HttpError =>
  typeof error === 'object' &&
  error !== null &&
  typeof (error as { status?: unknown }).status === 'number';

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'No encontramos el recurso solicitado.' });
};

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(error);
    return;
  }

  console.error(`[error] ${req.method} ${req.originalUrl}:`, error);

  if ((error as ParseError)?.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'La solicitud no es válida.' });
    return;
  }

  if (hasStatus(error)) {
    res.status(error.status).json({ message: error.message });
    return;
  }

  res.status(500).json({ message: 'Ocurrió un error inesperado. Intenta de nuevo.' });
};
