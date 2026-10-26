import type { Reservation, ReservationStatus, User } from '../types';

export interface UserRow {
  id: number;
  email: string;
  created_at: string;
}

export interface ReservationRow {
  id: number;
  court_id: number;
  court_name: string;
  reservation_date: string;
  start_hour: number;
  end_hour: number;
  status: ReservationStatus;
  created_at: string;
  cancelled_at: string | null;
}

export const mapUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  createdAt: row.created_at,
});

export const mapReservation = (row: ReservationRow): Reservation => ({
  id: row.id,
  courtId: row.court_id,
  courtName: row.court_name,
  date: row.reservation_date,
  startHour: row.start_hour,
  endHour: row.end_hour,
  status: row.status,
  createdAt: row.created_at,
  cancelledAt: row.cancelled_at,
});
