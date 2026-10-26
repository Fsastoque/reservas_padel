import type { NextFunction, Request, Response } from 'express';
import {
  cancelReservation,
  createReservation,
  getUserReservations,
} from '../services/reservationsService';

export const createReservationHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const reservation = createReservation(req.user!.id, req.body ?? {});
    res.status(201).json({ reservation });
  } catch (error) {
    next(error);
  }
};

export const listReservations = (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.status(200).json(getUserReservations(req.user!.id));
  } catch (error) {
    next(error);
  }
};

export const cancelReservationHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const reservation = cancelReservation(req.params.id, req.user!.id);
    res.status(200).json({ message: 'Reserva cancelada.', reservation });
  } catch (error) {
    next(error);
  }
};
