import { db } from '../config/db';
import type { Block } from '../types';
import { formatHour, isDateString, isPastDate } from '../utils/datetime';
import { httpError } from '../utils/httpError';
import { courtExists } from './courtsService';

interface Availability {
  courtId: number;
  date: string;
  blocks: Block[];
}

export const getAvailability = (courtIdInput: unknown, dateInput: unknown): Availability => {
  const courtId = Number(courtIdInput);
  const date = typeof dateInput === 'string' ? dateInput : '';

  if (!Number.isInteger(courtId) || !courtExists(courtId)) {
    throw httpError(400, 'Selecciona una cancha válida.');
  }
  if (!isDateString(date)) {
    throw httpError(400, 'Selecciona una fecha válida.');
  }
  if (isPastDate(date)) {
    throw httpError(400, 'La fecha debe ser hoy o una fecha futura.');
  }

  const reservedRows = db
    .prepare(
      `SELECT start_hour FROM reservas
       WHERE court_id = ? AND reservation_date = ? AND status = 'active'`,
    )
    .all(courtId, date) as Array<{ start_hour: number }>;

  const reservedHours = new Set(reservedRows.map((row) => row.start_hour));

  const blocks: Block[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    startTime: formatHour(hour),
    endTime: formatHour(hour + 1),
    status: reservedHours.has(hour) ? 'reserved' : 'available',
  }));

  return { courtId, date, blocks };
};
