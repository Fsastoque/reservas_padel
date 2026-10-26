import type { AvailabilityResponse, Court } from '../types';
import { api } from './api';

export const fetchCourts = async (): Promise<Court[]> => {
  const { data } = await api.get<{ courts: Court[] }>('/courts');
  return data.courts;
};

export const fetchAvailability = async (
  courtId: number,
  date: string,
): Promise<AvailabilityResponse> => {
  const { data } = await api.get<AvailabilityResponse>('/availability', {
    params: { courtId, date },
  });
  return data;
};
