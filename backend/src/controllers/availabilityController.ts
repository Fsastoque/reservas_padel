import type { NextFunction, Request, Response } from 'express';
import { getAvailability } from '../services/availabilityService';

export const getAvailabilityHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const availability = getAvailability(req.query.courtId, req.query.date);
    res.status(200).json(availability);
  } catch (error) {
    next(error);
  }
};
