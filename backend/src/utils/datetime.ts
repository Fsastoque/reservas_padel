const pad = (value: number): string => String(value).padStart(2, '0');

export const formatHour = (hour: number): string => `${pad(hour)}:00`;

export const todayLocalDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const currentLocalHour = (): number => new Date().getHours();

export const isDateString = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const isPastDate = (date: string): boolean => date < todayLocalDate();

export const isBlockPast = (date: string, hour: number): boolean => {
  const today = todayLocalDate();
  return date < today || (date === today && hour <= currentLocalHour());
};

export const formatDateForMessage = (date: string): string => date.split('-').reverse().join('/');
