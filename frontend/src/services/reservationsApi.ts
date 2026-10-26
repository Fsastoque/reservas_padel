import type { Reservation, ReservationsResponse } from '../types';
import { api } from './api';

interface CreateReservationInput {
  courtId: number;
  date: string;
  hour: number;
}

export const createReservation = async (input: CreateReservationInput): Promise<Reservation> => {
  const { data } = await api.post<{ reservation: Reservation }>('/reservations', input);
  return data.reservation;
};

export const fetchMyReservations = async (): Promise<ReservationsResponse> => {
  const { data } = await api.get<ReservationsResponse>('/reservations');
  return data;
};

export const cancelReservation = async (reservationId: number): Promise<Reservation> => {
  const { data } = await api.post<{ reservation: Reservation }>(
    `/reservations/${reservationId}/cancel`,
  );
  return data.reservation;
};
