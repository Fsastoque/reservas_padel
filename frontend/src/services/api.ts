import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const fallbackMessage = 'No pudimos completar la acción. Intenta de nuevo.';

export const getErrorMessage = (error: unknown, fallback = fallbackMessage): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = (error.response?.data as { message?: string } | undefined)?.message;
    if (responseMessage) return responseMessage;

    if (!error.response) {
      return 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.';
    }
  }

  return fallback;
};

export const isUnauthorized = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 401;
