const pad = (value: number): string => String(value).padStart(2, '0');

export const todayLocalDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const isDateString = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const formatHour = (hour: number): string => `${pad(hour)}:00`;

export const formatHourRange = (startHour: number, endHour: number): string =>
  `${formatHour(startHour)} – ${formatHour(endHour)}`;

export const formatDateLong = (date: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;

  const formatted = new Date(year, month - 1, day).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const formatDateShort = (date: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;

  return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const isBlockPast = (date: string, hour: number): boolean => {
  const today = todayLocalDate();
  return date < today || (date === today && hour <= new Date().getHours());
};
