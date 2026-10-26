export const isUniqueConstraintError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) return false;

  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' && code.startsWith('SQLITE_CONSTRAINT') && code.includes('UNIQUE');
};
