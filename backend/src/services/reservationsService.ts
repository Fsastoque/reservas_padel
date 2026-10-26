import { db } from '../config/db';
import type { Reservation } from '../types';
import {
  currentLocalHour,
  formatDateForMessage,
  formatHour,
  isBlockPast,
  isDateString,
  todayLocalDate,
} from '../utils/datetime';
import { isUniqueConstraintError } from '../utils/dbErrors';
import { httpError } from '../utils/httpError';
import { mapReservation, type ReservationRow } from '../utils/mappers';
import { courtExists } from './courtsService';

const reservationSelect = `
  SELECT r.id, r.court_id, c.name AS court_name, r.reservation_date,
         r.start_hour, r.end_hour, r.status, r.created_at, r.cancelled_at
  FROM reservas r
  JOIN canchas c ON c.id = r.court_id
`;

const isUpcoming = (reservation: Reservation): boolean => {
  if (reservation.status !== 'active') return false;

  const today = todayLocalDate();
  return (
    reservation.date > today ||
    (reservation.date === today && reservation.startHour > currentLocalHour())
  );
};

export const getReservationById = (reservationId: number): Reservation | null => {
  const row = db
    .prepare(`${reservationSelect} WHERE r.id = ?`)
    .get(reservationId) as ReservationRow | undefined;

  return row ? mapReservation(row) : null;
};

export const getVigenteReservation = (userId: number): Reservation | null => {
  const today = todayLocalDate();
  const hour = currentLocalHour();

  const row = db
    .prepare(
      `${reservationSelect}
       WHERE r.user_id = ?
         AND r.status = 'active'
         AND (r.reservation_date > ? OR (r.reservation_date = ? AND r.start_hour > ?))
       ORDER BY r.reservation_date ASC, r.start_hour ASC
       LIMIT 1`,
    )
    .get(userId, today, today, hour) as ReservationRow | undefined;

  return row ? mapReservation(row) : null;
};

interface CreateReservationInput {
  courtId?: unknown;
  date?: unknown;
  hour?: unknown;
}

export const createReservation = (userId: number, input: CreateReservationInput): Reservation => {
  const courtId = Number(input.courtId);
  const hour = Number(input.hour);
  const date = typeof input.date === 'string' ? input.date : '';

  if (!Number.isInteger(courtId) || !courtExists(courtId)) {
    throw httpError(400, 'Selecciona una cancha válida.');
  }
  if (!isDateString(date)) {
    throw httpError(400, 'Selecciona una fecha válida.');
  }
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw httpError(400, 'Selecciona un bloque horario válido.');
  }
  if (isBlockPast(date, hour)) {
    throw httpError(400, 'Ese horario ya pasó. Elige un bloque futuro.');
  }

  const book = db.transaction((): Reservation => {
    const vigente = getVigenteReservation(userId);

    if (vigente) {
      throw httpError(
        409,
        `Ya tienes una reserva vigente: ${vigente.courtName}, ${formatDateForMessage(
          vigente.date,
        )} de ${formatHour(vigente.startHour)} a ${formatHour(
          vigente.endHour,
        )}. Cancélala o espera a que pase antes de reservar otro turno.`,
      );
    }

    try {
      const result = db
        .prepare(
          `INSERT INTO reservas (user_id, court_id, reservation_date, start_hour, end_hour, status)
           VALUES (?, ?, ?, ?, ?, 'active')`,
        )
        .run(userId, courtId, date, hour, hour + 1);

      const reservation = getReservationById(Number(result.lastInsertRowid));
      if (!reservation) {
        throw httpError(500, 'No pudimos guardar tu reserva. Intenta de nuevo.');
      }

      return reservation;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw httpError(
          409,
          'La cancha ya fue reservada en este horario. Elige otro bloque disponible.',
        );
      }
      throw error;
    }
  });

  return book.immediate();
};

export const getUserReservations = (
  userId: number,
): { upcoming: Reservation[]; past: Reservation[] } => {
  const rows = db
    .prepare(
      `${reservationSelect}
       WHERE r.user_id = ?
       ORDER BY r.reservation_date DESC, r.start_hour DESC`,
    )
    .all(userId) as ReservationRow[];

  const reservations = rows.map(mapReservation);

  const upcoming = reservations
    .filter(isUpcoming)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour);

  const past = reservations.filter((reservation) => !isUpcoming(reservation));

  return { upcoming, past };
};

interface ReservationOwnerRow {
  user_id: number;
}

export const cancelReservation = (reservationIdInput: unknown, userId: number): Reservation => {
  const reservationId = Number(reservationIdInput);

  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    throw httpError(400, 'Reserva inválida.');
  }

  const owner = db
    .prepare('SELECT user_id FROM reservas WHERE id = ?')
    .get(reservationId) as ReservationOwnerRow | undefined;

  if (!owner || owner.user_id !== userId) {
    throw httpError(403, 'No puedes modificar una reserva que no te pertenece.');
  }

  const reservation = getReservationById(reservationId);
  if (!reservation) {
    throw httpError(403, 'No puedes modificar una reserva que no te pertenece.');
  }
  if (reservation.status === 'cancelled') {
    throw httpError(409, 'Esta reserva ya fue cancelada.');
  }
  if (isBlockPast(reservation.date, reservation.startHour)) {
    throw httpError(409, 'Solo puedes cancelar reservas futuras.');
  }

  const result = db
    .prepare(
      `UPDATE reservas
       SET status = 'cancelled', cancelled_at = datetime('now')
       WHERE id = ? AND user_id = ? AND status = 'active'`,
    )
    .run(reservationId, userId);

  if (result.changes === 0) {
    throw httpError(409, 'Esta reserva ya fue cancelada.');
  }

  return getReservationById(reservationId) as Reservation;
};
