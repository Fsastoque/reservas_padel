import type { User } from '../types';
import { api, isUnauthorized } from './api';

interface AuthResponse {
  user: User;
}

export const registerUser = async (
  email: string,
  password: string,
  confirmPassword: string,
): Promise<User> => {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    email,
    password,
    confirmPassword,
  });
  return data.user;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data.user;
};

export const logoutUser = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const { data } = await api.get<AuthResponse>('/auth/me');
    return data.user;
  } catch (error) {
    if (isUnauthorized(error)) return null;
    throw error;
  }
};
