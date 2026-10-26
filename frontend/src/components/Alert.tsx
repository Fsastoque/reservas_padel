import type { ReactNode } from 'react';

type AlertTone = 'error' | 'success' | 'info';

const tones: Record<AlertTone, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  info: 'border-line bg-white text-ink/75',
};

interface AlertProps {
  tone?: AlertTone;
  children: ReactNode;
}

export const Alert = ({ tone = 'error', children }: AlertProps) => (
  <div
    role={tone === 'error' ? 'alert' : 'status'}
    className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}
  >
    {children}
  </div>
);
