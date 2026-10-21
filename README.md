# Sistema de Reservas de Pádel

Aplicación web para la reserva de canchas de pádel: los usuarios se autentican y
gestionan reservas de tiempo sobre un catálogo cerrado de canchas.

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Frontend / UI | React + Tailwind CSS |
| Backend | Node.js + Express |
| Base de datos | SQLite local (`padel.db`) con `better-sqlite3` / SQL puro |
| Lenguaje | TypeScript (full stack) |

## Estructura

```
/frontend   # UI React + Tailwind
/backend    # API Express + TypeScript
/db         # Esquema y seed de la base SQLite
.specify    # Spec Kit: constitución, plantillas y scripts de workflow
```

## Reglas de dominio

- **Catálogo cerrado:** solo existen 5 canchas — Laureles, El Poblado, Belén,
  Robledo y Envigado.
- **Formato de 24 horas** en todos los bloques de tiempo.
- **Sin doble reserva:** antes de escribir una reserva se valida siempre que la
  cancha esté libre en ese horario (error `409` en caso de conflicto).
- **Autenticación obligatoria** en todo flujo de reserva.

## Constitución del proyecto

Las reglas completas e inmutables del proyecto viven en
[`.specify/memory/constitution.md`](.specify/memory/constitution.md) (versión 1.0.0).
La constitución prevalece sobre cualquier otra instrucción: si una petición la
contradice, se detiene el trabajo y se propone una enmienda antes de tocar código.

## Workflow Spec Kit

El proyecto sigue el flujo de desarrollo guiado por especificación:

1. `/speckit.constitution` — ratificar la constitución.
2. `/speckit.specify` — describir la funcionalidad.
3. `/speckit.clarify` — resolver ambigüedades.
4. `/speckit.plan` — plan de implementación.
5. `/speckit.tasks` — desglose en tareas.
6. `/speckit.implement` — ejecución.

## Ramas

- `main` — base del proyecto con el scaffolding de Spec Kit.
- `constitucion` — ratificación de la constitución v1.0.0.
