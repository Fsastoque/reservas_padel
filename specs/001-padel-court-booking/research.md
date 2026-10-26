# Research: Sistema de Reservas de Pádel

**Feature**: `001-padel-court-booking` | **Date**: 2026-10-25

## Decisiones técnicas

### 1. SQLite con `better-sqlite3` y SQL puro

**Decisión**: Usar `better-sqlite3` con sentencias preparadas y SQL explícito, sin ORM.

**Razón**: La constitución prohíbe ORMs pesados y exige `better-sqlite3` o SQL puro.
La API síncrona de `better-sqlite3` simplifica las transacciones y evita problemas de
concurrencia en un servidor Node de un solo proceso.

**Alternativas descartadas**: Prisma/TypeORM/Drizzle (peso y capa innecesaria para
cuatro tablas); `sqlite3` asíncrono (callbacks y transacciones más laboriosas).

### 2. Sesiones propias almacenadas en SQLite

**Decisión**: Cookie `sessionId` `HttpOnly` + `SameSite=Lax`; token aleatorio de 32
bytes; fila en `sesiones` con `expires_at`. Sin `express-session`.

**Razón**: La spec exige sesión del lado del servidor y persistencia entre visitas
hasta el logout. Una implementación mínima evita una dependencia adicional y mantiene
el control explícito sobre el ciclo de vida. `HttpOnly` protege el token de JavaScript;
`SameSite=Lax` reduce CSRF en un flujo same-site (`localhost:5173` → `localhost:3000`).
La sesión se revalida en cada request y `logout` elimina la fila.

**Alternativas descartadas**: JWT en cookie/localStorage (no revocable de inmediato,
más superficie); `express-session` en memoria (se pierde al reiniciar).

### 3. Contraseñas con bcryptjs

**Decisión**: `bcryptjs` con 10 rondas; hash almacenado en `password_hash`.

**Razón**: Cumple el requisito de hash seguro sin binarios nativos adicionales.
Las credenciales inválidas devuelven siempre el mismo mensaje `401` y se compara
contra un hash de relleno cuando el correo no existe, para no filtrar la existencia
de cuentas por tiempos de respuesta.

### 4. Representación de fechas y horas

**Decisión**: Fecha local `YYYY-MM-DD` en `reservation_date`; hora entera 0–23 en
`start_hour` y `end_hour = start_hour + 1`.

**Razón**: La spec exige formato de 24 horas y bloques de una hora. Guardar la hora
como entero evita ambigüedades de zona horaria y permite comparar rangos de forma
directa. Las fechas se comparan lexicográficamente al estar en ISO. La UI muestra
`HH:00` y `24:00` para el fin del día.

**Alternativas descartadas**: `DATETIME` único (dificulta bloques y comparaciones);
timestamps UTC (el club opera en hora local y el usuario elige fecha/hora locales).

### 5. Prevención de colisiones en dos capas

**Decisión**:
1. Transacción `BEGIN IMMEDIATE` que revalida y luego inserta.
2. Índice UNIQUE parcial `(court_id, reservation_date, start_hour) WHERE status='active'`.

**Razón**: La spec define la doble reserva como regla crítica y pide revalidación al
confirmar. La transacción serializa escrituras; el índice garantiza la invariante
incluso si la comprobación previa fallara. Al ser parcial, una reserva cancelada
libera el bloque (requisito de cancelación) sin borrar historial.

**Alternativas descartadas**: Solo comprobar con `SELECT` (condición de carrera);
UNIQUE total (impediría volver a reservar bloques cancelados).

### 6. Disponibilidad calculada, no persistida

**Decisión**: `GET /api/availability` genera 24 bloques y marca `reserved` a partir de
las reservas activas de esa cancha/fecha.

**Razón**: Evita tablas y procesos de sincronización; el estado siempre refleja las
reservas reales. Los bloques pasados se deshabilitan en la UI y se rechazan en el
backend, por lo que no necesitan un estado persistido adicional.

**Alternativas descartadas**: Tabla de bloques pregenerada (mantenimiento y riesgo de
desincronización).

### 7. Definición de reserva "vigente" y estados derivados

**Decisión**: Persistir solo `active`/`cancelled`. Considerar "vigente" a una reserva
`active` cuya fecha/hora de inicio aún no ocurrió. Las activas ya iniciadas se
presentan como "finalizadas" en el historial.

**Razón**: Evita jobs de actualización de estado y mantiene el historial íntegro.
La regla "máximo una reserva vigente" se evalúa con fecha/hora local en la consulta.

### 8. Frontend React + Vite + Tailwind con axios

**Decisión**: SPA con React Router, contexto de autenticación (`useAuth`), axios con
`withCredentials: true`, Tailwind CSS para estilos y validación de UX en el cliente.

**Razón**: Cumple la constitución (React, Tailwind, componentes funcionales, Hooks,
TypeScript). El backend sigue siendo la fuente de verdad: el cliente valida para dar
feedback inmediato, pero repite todas las reglas críticas en el servidor.
La cookie same-site se envía gracias a CORS con origen exacto y credenciales.

**Alternativas descartadas**: Next.js/SSR (fuera de la estructura plana y del alcance);
fetch sin cliente HTTP (axios simplifica manejo de errores y credenciales).

### 9. Manejo de errores y códigos HTTP

**Decisión**: Un middleware central traduce errores a mensajes en español sin stack
traces. Códigos usados: `400` datos inválidos, `401` sin sesión/credenciales,
`403` reserva ajena, `404` recurso inexistente, `409` conflicto (correo duplicado,
colisión de bloque, reserva vigente, cancelación no permitida), `500` genérico.

**Razón**: Requisito explícito de errores amigables y de los códigos 400/401/409.
Los detalles técnicos quedan solo en el log del servidor.

### 10. Sin tests automatizados en esta entrega

**Decisión**: No se agrega framework de pruebas.

**Razón**: La spec y `tasks.md` no solicitan tests; el alcance se validó contra
`quickstart.md` mediante recorridos de API y de interfaz. Si se incorporan pruebas en
el futuro, el punto natural es `backend/src/services` (reglas de vigencia y colisión)
y los flujos de reserva en el frontend.
