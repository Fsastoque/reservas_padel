export interface HttpError extends Error {
  status: number;
}

export const httpError = (status: number, message: string): HttpError =>
  Object.assign(new Error(message), { status });
