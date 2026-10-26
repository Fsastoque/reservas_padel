# Quickstart: Sistema de Reservas de Pádel

**Feature**: `001-padel-court-booking` | **Date**: 2026-10-22

## Requisitos
- Node.js 18+
- npm/pnpm
- Git

## Estructura
```
/frontend  (React + Vite + Tailwind)
/backend   (Express + TypeScript)
/db        (SQLite + schema)
```

## Setup (desarrollo)

### 1) Base de datos
El backend crea `db/padel.db`, aplica `db/schema.sql` y siembra las 5 canchas
desde `db/seed.sql` automáticamente al iniciar. No hace falta ejecutar SQL a mano.

Verificación opcional (si tienes el CLI de SQLite):
```bash
sqlite3 db/padel.db ".schema"
```

### 2) Backend
```bash
cd backend
cp .env.example .env  # configurar PORT, SESSION_SECRET, etc.
npm install
npm run dev
# API en http://localhost:3000
```

### 3) Frontend
```bash
cd frontend
npm install
npm run dev
# App en http://localhost:5173
```

## Escenarios de validación (end-to-end)

### Escenario A: Registro y login
1. Ir a `/register` con email válido y contraseña >=8 chars + confirmación igual → sesión iniciada
2. Cerrar sesión → `/login` requerido para acciones protegidas
3. Login con credenciales incorrectas → mensaje genérico

### Escenario B: Ver canchas y disponibilidad (sin sesión)
1. Sin sesión, ir a `/courts` → ver las 5 canchas y calendario
2. Intentar abrir grilla → redirigir a login/registro

### Escenario C: Reservar turno
1. Logueado, ir a `/courts`, seleccionar cancha y fecha
2. Ver grilla 24h: bloques "Disponibles"/"Reservados"
3. Seleccionar bloque libre y confirmar → reserva creada
4. Ver bloque como "Reservado" para otros usuarios
5. Intentar reservar segundo turno → rechazado (máx 1 reserva vigente)

### Escenario D: Colisión (carrera)
1. Dos usuarios logueados
2. Ambos ven mismo bloque "Disponible"
3. Usuario A confirma primero → éxito (201)
4. Usuario B confirma después → 409 con mensaje amigable "La cancha ya fue reservada en este horario"

### Escenario E: Mis reservas y cancelación
1. Ir a `/mis-reservas` → ver futuras e historial
2. Cancelar reserva futura → confirmación, desaparece de futuras, bloque vuelve a "Disponible"
3. Intentar cancelar reserva pasada → rechazado

### Escenario F: Reglas de tiempo
1. Intentar reservar bloque ya transcurrido → rechazado
2. Cambiar fecha a ayer → no seleccionable / grilla sin bloques reservables

## Validación de constitución
- [ ] Solo 5 canchas estáticas
- [ ] Bloques 1h / 24h
- [ ] Re-validación + UNIQUE evita doble reserva
- [ ] Errores sin stack traces, HTTP 400/401/409
- [ ] Sin pagos/admin/notificaciones/matchmaking
- [ ] Estructura /frontend, /backend, /db
- [ ] Sin ORMs pesados
