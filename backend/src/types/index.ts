export interface User {
  id: number;
  email: string;
  createdAt: string;
}

export interface Court {
  id: number;
  name: string;
}

export type ReservationStatus = 'active' | 'cancelled';

export interface Reservation {
  id: number;
  courtId: number;
  courtName: string;
  date: string;
  startHour: number;
  endHour: number;
  status: ReservationStatus;
  createdAt: string;
  cancelledAt: string | null;
}

export type BlockStatus = 'available' | 'reserved';

export interface Block {
  hour: number;
  startTime: string;
  endTime: string;
  status: BlockStatus;
}
