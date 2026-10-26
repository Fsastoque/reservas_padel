# Data Model: Sistema de Reservas de Pádel

**Feature**: `001-padel-court-booking` | **Date**: 2026-10-25

Base de datos SQLite local (`db/padel.db`) gestionada con `better-sqlite3` y SQL puro.
El esquema se aplica al iniciar el backend desde `db/schema.sql` (idempotente) y el
catálogo se siembra desde `db/seed.sql` solo si la tabla `canchas` está vacía.

## Entidades

### `usuarios`

| Columna | Tipo | Restricciones |
|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `email` | TEXT | NOT NULL, UNIQUE, `COLLATE NOCASE` |
| `password_hash` | TEXT | NOT NULL (bcryptjs, 10 rondas) |
| `created_at` | TEXT | NOT NULL, default `datetime('now')` |

Reglas:

- El correo se normaliza a minúsculas antes de guardar y comparar.
- El hash nunca se expone en las respuestas de la API.
- Un correo duplicado produce `409`.

### `canchas`

| Columna | Tipo | Restricciones |
|---|---|---|
| `id` | INTEGER | PK (1–5) |
| `name` | TEXT | NOT NULL, UNIQUE |

Catálogo cerrado e inmutable, sembrado con exactamente cinco filas:

1. Cancha Laureles
2. Cancha El Poblado
3. Cancha Belén
4. Cancha Robledo
5. Cancha Envigado

No existen endpoints de creación, edición ni borrado de canchas.

### `reservas`

| Columna | Tipo | Restricciones |
|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `user_id` | INTEGER | NOT NULL, FK → `usuarios(id)` |
| `court_id` | INTEGER | NOT NULL, FK → `canchas(id)` |
| `reservation_date` | TEXT | NOT NULL, fecha local `YYYY-MM-DD` |
| `start_hour` | INTEGER | NOT NULL, CHECK 0–23 |
| `end_hour` | INTEGER | NOT NULL, CHECK 1–24, `end_hour = start_hour + 1` |
| `status` | TEXT | NOT NULL, CHECK `active`/`cancelled`, default `active` |
| `created_at` | TEXT | NOT NULL, default `datetime('now')` |
| `cancelled_at` | TEXT | NULL |

Índices:

- `ux_reservas_bloque_activo`: UNIQUE parcial sobre
  `(court_id, reservation_date, start_hour) WHERE status = 'active'`.
  Garantiza a nivel de base de datos que un bloque activo no se repita, y permite
  volver a reservar un bloque cuya reserva fue cancelada.
- `ix_reservas_usuario`: `(user_id, reservation_date, start_hour)` para consultar
  reservas propias y la reserva vigente.
- `ix_reservas_cancha_fecha`: `(court_id, reservation_date, status)` para construir
  la grilla de disponibilidad.

Estados:

- **Persistidos**: `active` y `cancelled`.
- **Derivados por tiempo**: una reserva `active` cuya hora de inicio ya pasó se
  presenta como *finalizada* en el historial. No se persiste un estado adicional.
- **Vigente**: reserva `active` cuya fecha/hora de inicio todavía no ha ocurrido.
  Es la única que bloquea la creación de una nueva reserva del mismo usuario.

Reglas de negocio:

- Cada reserva ocupa exactamente un bloque de una hora (`start_hour`, `end_hour`).
- No se permiten fechas pasadas ni horas ya transcurridas/iniciadas.
- Un usuario puede tener como máximo una reserva vigente.
- Una reserva pasada o iniciada no se puede cancelar.
- El historial conserva reservas pasadas y canceladas.
- Las reservas pertenecen a un único usuario y solo él puede consultarlas y
  cancelarlas.

### `sesiones`

| Columna | Tipo | Restricciones |
|---|---|---|
| `id` | TEXT | PK (token aleatorio de 32 bytes en hexadecimal) |
| `user_id` | INTEGER | NOT NULL, FK → `usuarios(id)` ON DELETE CASCADE |
| `data` | TEXT | NULL (reservado para datos de sesión) |
| `expires_at` | TEXT | NOT NULL, ISO 8601 |
| `created_at` | TEXT | NOT NULL, default `datetime('now')` |

Índices: `ix_sesiones_usuario` (`user_id`) e `ix_sesiones_expira` (`expires_at`).

Reglas:

- El token viaja en una cookie `sessionId` `HttpOnly`, `SameSite=Lax`, `Path=/`.
- La sesión se valida contra la base de datos en cada request.
- `logout` elimina la fila y limpia la cookie.
- Las sesiones expiradas se eliminan de forma oportunista.

## Relaciones

```text
usuarios 1 ──── N reservas N ──── 1 canchas
usuarios 1 ──── N sesiones
```

## Invariante crítica: prevención de doble reserva

La creación de una reserva se ejecuta dentro de una transacción
`BEGIN IMMEDIATE` (`db.transaction(...).immediate()`) que, en orden:

1. Revalida cancha, fecha, hora y que el bloque no haya pasado.
2. Comprueba que el usuario no tenga una reserva vigente.
3. Inserta la reserva `active`.

Si dos solicitudes compiten por el mismo bloque, el índice único parcial hace que
solo una inserción se confirme; la otra viola `SQLITE_CONSTRAINT_UNIQUE` y la API
responde `409` con un mensaje amigable. El índice es la última línea de defensa,
incluso ante fallos de la validación en aplicación.

## Disponibilidad

La grilla no se persiste: se calcula bajo demanda para `(courtId, date)`.

- 24 bloques, de `00:00` a `24:00`, en formato de 24 horas.
- Un bloque es `reserved` si existe una reserva `active` para esa cancha, fecha y
  hora; en caso contrario es `available`.
- Los bloques ya transcurridos del día actual se muestran deshabilitados en la
  interfaz y el backend rechaza cualquier intento de reservarlos.

## Retención y ciclo de vida

- Las reservas canceladas no se borran: pasan al historial con `cancelled_at`.
- Las reservas pasadas se conservan para el historial del usuario.
- Las sesiones expiradas se eliminan; las reservas no dependen de la sesión.
