-- Esquema de la base de datos de reservas de pádel.
-- Ejecutado al iniciar el backend; es idempotente.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS canchas (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS reservas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES usuarios(id),
  court_id INTEGER NOT NULL REFERENCES canchas(id),
  reservation_date TEXT NOT NULL,
  start_hour INTEGER NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
  end_hour INTEGER NOT NULL CHECK (end_hour BETWEEN 1 AND 24),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  cancelled_at TEXT,
  CHECK (end_hour = start_hour + 1)
);

-- Una sola reserva activa por bloque de cancha/fecha/hora.
-- Las reservas canceladas no bloquean el bloque: el índice es parcial.
CREATE UNIQUE INDEX IF NOT EXISTS ux_reservas_bloque_activo
  ON reservas (court_id, reservation_date, start_hour)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS ix_reservas_usuario
  ON reservas (user_id, reservation_date, start_hour);

CREATE INDEX IF NOT EXISTS ix_reservas_cancha_fecha
  ON reservas (court_id, reservation_date, status);

CREATE TABLE IF NOT EXISTS sesiones (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  data TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS ix_sesiones_usuario ON sesiones (user_id);
CREATE INDEX IF NOT EXISTS ix_sesiones_expira ON sesiones (expires_at);
