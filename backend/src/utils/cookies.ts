export const SESSION_COOKIE_NAME = 'sessionId';

export const parseCookies = (header?: string): Record<string, string> => {
  if (!header) return {};

  return header.split(';').reduce<Record<string, string>>((cookies, part) => {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex === -1) return cookies;

    const name = part.slice(0, separatorIndex).trim();
    if (!name) return cookies;

    const rawValue = part.slice(separatorIndex + 1).trim();
    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch {
      cookies[name] = rawValue;
    }

    return cookies;
  }, {});
};

const securityFlags = (): string => (process.env.NODE_ENV === 'production' ? '; Secure' : '');

export const buildSessionCookie = (sessionId: string, maxAgeSeconds: number): string =>
  `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${securityFlags()}`;

export const buildClearSessionCookie = (): string =>
  `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${securityFlags()}`;
