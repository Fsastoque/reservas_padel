# Implementation Plan: Sistema de Reservas de Pádel

**Branch**: `001-padel-court-booking` | **Date**: 2026-10-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-padel-court-booking/spec.md`

## Summary

Implementar una aplicación web para la reserva de canchas de pádel con autenticación por correo/contraseña, listado estático de las 5 canchas, consulta de disponibilidad por fecha en grilla de 24 bloques de 1 hora, creación de reservas con re-validación obligatoria para evitar colisiones, gestión de "Mis Reservas" (futuras/historial) y cancelación de reservas futuras. Todo ello respetando el catálogo cerrado, formato 24h, prevención de *double-booking*, autenticación obligatoria y la restricción de "una reserva vigente a la vez".

## Technical Context

**Language/Version**: TypeScript 5.x (frontend + backend)

**Primary Dependencies**: React 18 + Vite, Tailwind CSS, Node.js + Express, better-sqlite3, express-session o sesión propia con cookie httpOnly, bcryptjs. Sin ORMs pesados.

**Storage**: SQLite local (`padel.db`) en `/db/`. Esquema con sentencias SQL puras.

**Testing**: Vitest + Supertest

**Target Platform**: Web (navegador moderno) / Node.js local

**Project Type**: Web application (frontend + backend + db)

**Performance Goals**: < 200ms para disponibilidad y confirmación

**Constraints**:
- Estructura plana `/frontend`, `/backend`, `/db`
- Sin Clean Architecture / patrones complejos
- Componentes funcionales React + Hooks
- Sin pagos, sin panel admin, sin notificaciones, sin multi-hora, sin matchmaking
- Errores amigables, sin stack traces
- HTTP 400/401/409
- 5 canchas fijas, 24 bloques/hora, 1h por reserva

**Scale/Scope**: Uso club, alcance acotado a la spec

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Regla | Estado | Notas |
|---|---|---|
| Stack (React/Tailwind/Express/SQLite/TS) | OK | Con better-sqlite3/SQL puro |
| Catálogo cerrado 5 canchas | OK | Estático/inmutable |
| Bloques 24h/1h | OK | Grilla fija |
| Prevención doble-reserva | OK | Re-validación + UNIQUE en BD |
| Sesión activa obligatoria | OK | Protegido; sin sesión solo canchas+calendario |
| Estructura plana | OK | /frontend, /backend, /db |
| Funcional/Hooks, camelCase/PascalCase | OK | Convenciones |
| Errores amigables + 400/401/409 | OK | Sin detalles técnicos |
| Cero código sombra | OK | Sin funcionalidades fuera de spec |
| Gobernanza | OK | Plan validado contra constitución v1.0.0 |

**Gate:** PASS

## Project Structure

### Documentation
```text
specs/001-padel-court-booking/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md
```

### Source Code
```text
/frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── utils/
└── tests/

/backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middlewares/
│   ├── config/
│   ├── utils/
│   └── types/
└── tests/

/db/
├── schema.sql
├── migrations/
└── padel.db  (runtime, gitignored)
```

**Structure Decision**: Estructura plana obligatoria. REST JSON entre frontend y backend.

## Generated Artifacts (Phase 0/1)
- `research.md` — Decisiones técnicas resueltas
- `data-model.md` — Entidades, relaciones, índices y restricciones
- `contracts/openapi.yaml` — Contratos REST
- `quickstart.md` — Guía de setup y validación

## Complexity Tracking

Sin violaciones. No aplica.
