import type { NextFunction, Request, Response } from 'express';
import { getCourts } from '../services/courtsService';

export const listCourts = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    res.status(200).json({ courts: getCourts() });
  } catch (error) {
    next(error);
  }
};
