# Constitución del Proyecto: Sistema de Reservas de Pádel

## 1. Naturaleza del Proyecto

Este es una aplicación para la reserva de canchas de pádel. Su propósito es permitir a los
usuarios autenticarse y gestionar reservas de tiempo en espacios específicos.

## 2. Stack Tecnológico (Reglas de Implementación)

- **Frontend / UI:** React. Usar Tailwind CSS para los estilos.
- **Backend:** Node.js con Express.
- **Base de Datos:** SQLite local (archivo `padel.db`). No usar ORMs pesados para mantener
  la simplicidad; usar `better-sqlite3` o sentencias SQL puras.
- **Lenguaje:** TypeScript en todo el stack.

## 3. Reglas de Dominio y Lógica de Negocio

Estas reglas son inmutables. El agente de IA debe respetarlas estrictamente:

- **Catálogo Cerrado:** El sistema SOLO maneja 5 canchas fijas: Cancha Laureles,
  Cancha El Poblado, Cancha Belén, Cancha Robledo, y Cancha Envigado.
- **Bloques de Tiempo:** Las reservas operan en formato de 24 horas.
- **Prevención de Colisiones (Double-Booking):** Es la regla crítica del sistema. Bajo
  ninguna circunstancia se puede escribir una reserva en la base de datos sin validar
  primero que la cancha seleccionada esté libre en ese horario.
- **Autenticación:** Todo flujo de reserva exige que haya un usuario con sesión activa.

## 4. Estructura y Estilo de Código

- **Estructura Plana:** Evitar la sobreingeniería. No implementar "Clean Architecture" ni
  patrones complejos. Usar una estructura simple: `/frontend`, `/backend`, y `/db`.
- **Estilo:** Priorizar la programación funcional y los componentes funcionales
  (Hooks en React). Evitar el uso de clases a menos que sea obligatorio.
- **Nomenclatura:** Usar `camelCase` para funciones/variables y `PascalCase` para
  Interfaces/Tipos.

## 5. Manejo de Errores y Validaciones

- **UI:** Nunca exponer errores crudos o *stack traces* al usuario final. Todo error
  técnico debe traducirse a un mensaje amigable (ej: "La cancha ya fue reservada en este
  horario").
- **Backend:** Retornar siempre códigos de estado HTTP semánticos (400 petición inválida,
  401 no autenticado, 409 conflicto de reserva).

## 6. Comportamiento del Agente de IA (Reglas SDD)

- **Cero Código Sombra (Shadow Code):** Construye estrictamente lo documentado en
  `spec.md`. No añadas características "por si acaso" (no pasarelas de pago, no perfiles
  complejos, etc.).
- **Fuente de la Verdad:** Si una instrucción del usuario contradice esta constitución o
  si detectas una falla lógica, detente. Advierte del problema y solicita actualizar el
  `spec.md` antes de tocar el código fuente.

## Governance

- **Supremacía:** Esta constitución prevalece sobre cualquier otra práctica, instrucción
  o atajo de implementación. Si una instrucción del usuario la contradice o se detecta
  una falla lógica, el agente se detiene y solicita una enmienda antes de tocar código.
- **Procedimiento de enmienda:** Toda enmienda debe proponerse por escrito (motivo y
  alcance), aprobarse explícitamente y documentarse en `spec.md` antes de aplicarse.
  Después de cada enmienda se verifica la coherencia entre esta constitución y `spec.md`.
- **Política de versionado:** Se usa versionado semántico MAJOR.MINOR.PATCH. MAJOR:
  eliminación o redefinición de principios (cambio incompatibile hacia atrás); MINOR:
  adición o ampliación material de principios/secciones; PATCH: aclaraciones, correcciones
  de redacción y refinos no semánticos.
- **Revisión de cumplimiento:** Todo plan (`plan.md`) y cada entrega de tareas (`tasks.md`)
  deben incluir una verificación explícita de cumplimiento de los principios de esta
  constitución antes de aprobarse. La complejidad añadida (por ejemplo, ORMs o patrones
  de arquitectura prohibidos) debe justificarse o rechazarse.

**Version**: 1.0.0 | **Ratified**: 2026-10-18 | **Last Amended**: 2026-10-18
