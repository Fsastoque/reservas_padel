# Feature Specification: Sistema de Reservas de Pádel

**Feature Branch**: `001-padel-court-booking`

**Created**: 2026-10-21

**Status**: Draft

**Input**: User description: "Sistema de reservas de canchas de pádel con autenticación de usuarios, exploración de disponibilidad por fecha, creación de reservas con prevención de colisiones y gestión de las reservas propias."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrarse e iniciar sesión (Priority: P1)

Como visitante del club, quiero crear una cuenta con mi correo electrónico y una contraseña, e iniciar sesión, para poder acceder a la disponibilidad de las canchas y reservar turnos.

**Why this priority**: Toda la funcionalidad posterior exige una sesión activa. Sin este User Story el producto no entrega ningún valor: es el prerrequisito de los demás.

**Independent Test**: Se puede probar de forma aislada registrando un usuario nuevo, cerrando sesión y volviendo a entrar con las mismas credenciales, sin necesidad de canchas ni reservas.

**Acceptance Scenarios**:

1. **Given** un visitante sin cuenta, **When** se registra con un correo con formato válido, una contraseña y su confirmación coincidente, **Then** se crea su cuenta, se inicia su sesión y accede al módulo de canchas.
2. **Given** un visitante sin cuenta, **When** se registra con un correo que ya está registrado, **Then** el registro se rechaza con un mensaje claro indicando que ese correo ya está en uso.
3. **Given** un visitante sin cuenta, **When** se registra con un correo con formato inválido o con contraseñas que no coinciden, **Then** el registro se rechaza indicando qué dato debe corregir.
4. **Given** un usuario registrado, **When** inicia sesión con correo y contraseña correctos, **Then** accede a su sesión y ve la disponibilidad de las canchas.
5. **Given** un usuario registrado, **When** inicia sesión con credenciales incorrectas, **Then** el acceso se rechaza con un mensaje genérico que no revela si el correo existe.
6. **Given** un usuario con sesión activa, **When** cierra sesión, **Then** la sesión termina y las acciones que requieren sesión quedan bloqueadas hasta volver a iniciarla.

---

### User Story 2 - Explorar canchas y consultar disponibilidad (Priority: P1)

Como usuario con sesión activa, quiero ver el listado de las canchas del club, elegir una fecha en un calendario y ver la grilla de horarios del día para saber exactamente qué turnos están libres y cuáles están tomados.

**Why this priority**: La disponibilidad es el punto de entrada al flujo de reserva. Sin ella el usuario no puede decidir qué turno tomar.

**Independent Test**: Se puede probar de forma aislada con un usuario registrado que abre el módulo de reservas, selecciona una cancha y una fecha y observa la grilla, sin necesidad de crear reservas.

**Acceptance Scenarios**:

1. **Given** un usuario con sesión activa, **When** entra al módulo de reservas, **Then** ve el listado con Cancha Laureles, Cancha El Poblado, Cancha Belén, Cancha Robledo y Cancha Envigado.
2. **Given** un usuario con sesión activa, **When** elige una cancha y una fecha en el calendario, **Then** ve la grilla de 24 bloques horarios de 1 hora para esa cancha y esa fecha.
3. **Given** una grilla de disponibilidad visible, **When** el usuario la observa, **Then** cada bloque indica de forma inequívoca si está "Disponible" o "Reservado".
4. **Given** un bloque marcado como "Reservado", **When** el usuario intenta seleccionarlo, **Then** no puede iniciar una reserva sobre ese bloque.
5. **Given** un usuario sin sesión activa, **When** entra al módulo de reservas, **Then** ve el listado de las 5 canchas y el calendario, pero no la grilla de horarios.
6. **Given** un usuario sin sesión activa, **When** intenta ver la grilla de horarios de una cancha o confirmar una reserva, **Then** el sistema le pide iniciar sesión o registrarse antes de permitir la acción.
7. **Given** un usuario con sesión activa, **When** cambia de fecha en el calendario, **Then** la grilla se actualiza con el estado de los 24 bloques de la nueva fecha.

---

### User Story 3 - Crear una reserva (Priority: P1)

Como usuario con sesión activa, quiero seleccionar un bloque horario disponible y confirmarlo para asegurar mi turno, con la certeza de que el sistema vuelve a verificar la disponibilidad en el momento de confirmar.

**Why this priority**: Es el valor central del producto: sin reserva efectiva no hay sistema. Es la User Story que hace que todo lo demás exista.

**Independent Test**: Se puede probar de forma aislada con un usuario registrado que reserva un bloque libre en una fecha futura, y verificando que la reserva queda registrada y que el bloque pasa a "Reservado".

**Acceptance Scenarios**:

1. **Given** un usuario con sesión activa y sin reserva activa, **When** selecciona un bloque "Disponible" y confirma la reserva, **Then** la reserva se crea y aparece en su panel de "Mis Reservas" con cancha, fecha y hora.
2. **Given** un bloque que otro usuario reservó entre que fue mostrado y que se confirma, **When** el usuario confirma, **Then** la reserva se rechaza con un mensaje claro de que el horario ya no está disponible y la grilla refleja el estado actualizado.
3. **Given** un bloque ya transcurrido, **When** el usuario intenta seleccionarlo y reservarlo, **Then** el sistema no le permite crear la reserva.
4. **Given** un usuario que ya tiene una reserva vigente, **When** intenta crear una segunda reserva, **Then** el sistema se lo impide con un mensaje claro que explica la regla y le muestra su reserva vigente.
5. **Given** un usuario cuya única reserva vigente es cancelada o ya transcurrió, **When** intenta crear una reserva nueva, **Then** el sistema le permite reservar y el bloque queda en sus reservas.
5. **Given** una reserva confirmada, **When** cualquier otro usuario consulta la disponibilidad de esa cancha y fecha, **Then** ese bloque aparece como "Reservado".
6. **Given** un usuario sin sesión activa, **When** intenta confirmar una reserva, **Then** el sistema lo rechaza y le pide iniciar sesión.

---

### User Story 4 - Gestionar mis reservas (Priority: P2)

Como usuario con sesión activa, quiero ver mis reservas futuras y mi historial de reservas pasadas, y poder cancelar una reserva futura que ya no necesito, para recuperar ese turno y dejarlo disponible para otros jugadores.

**Why this priority**: Permite recuperar turnos y cierra el ciclo de vida de la reserva. Depende de las User Stories anteriores, por lo que va después, pero es necesaria para que el servicio sea usable en el día a día.

**Independent Test**: Se puede probar de forma aislada con un usuario que ya tiene reservas futuras y pasadas, revisando su panel y cancelando una reserva futura.

**Acceptance Scenarios**:

1. **Given** un usuario con reservas futuras, **When** abre "Mis Reservas", **Then** ve la lista de sus reservas futuras con el nombre de la cancha, la fecha y la hora de cada una.
2. **Given** un usuario con reservas pasadas, **When** revisa su panel, **Then** ve su historial de reservas pasadas con la misma información.
3. **Given** una reserva futura, **When** el usuario la selecciona y confirma la cancelación, **Then** la reserva queda cancelada y desaparece de la lista de futuras.
4. **Given** una reserva futura cancelada, **When** otro usuario consulta la disponibilidad de esa cancha y fecha, **Then** el bloque vuelve a estar "Disponible".
5. **Given** una reserva ya iniciada o pasada, **When** el usuario intenta cancelarla, **Then** el sistema no le permite cancelar y le indica que solo las reservas futuras son cancelables.
6. **Given** un usuario con sesión activa, **When** abre "Mis Reservas", **Then** ve únicamente sus propias reservas y nunca las de otros usuarios.
7. **Given** un usuario que intenta actuar sobre una reserva de otro usuario, **When** lo hace, **Then** el sistema lo rechaza sin revelar información de esa reserva.

---

### Edge Cases

- **Carrera entre dos usuarios**: dos usuarios confirman el mismo bloque en el mismo instante; solo una reserva puede materializarse y la otra debe ser rechazada con el mensaje de conflicto.
- **El bloque elegido alcanza el pasado mientras el usuario decide**: al confirmar, un bloque cuya hora ya comenzó se rechaza aunque antes fuera visible como disponible.
- **Horario no alineado**: un intento de reservar desde las 14:30 no corresponde a ningún bloque de la grilla y se rechaza.
- **Reservas canceladas y pasadas**: siguen visibles en el historial del usuario y no cuentan como reserva activa.
- **Acceso directo sin sesión**: un usuario no autenticado ve solo canchas y calendario; para ver la grilla o reservar debe iniciar sesión o registrarse.
- **Normalización del correo**: dos registros con el mismo correo pero distinta capitalización se consideran el mismo usuario y solo uno puede completarse.
- **Correo con formato inválido**: un correo sin arroba, con espacios o con caracteres no permitidos se rechaza en el registro.
- **Día actual**: la grilla del día en curso muestra como no reservables los bloques que ya transcurrieron.
- **Bloque en curso**: un bloque cuya hora de inicio ya pasó pero cuya hora de fin no, se considera transcurrido y no es reservable.
- **Canchas sin ninguna reserva**: todas las canchas de un día sin reservas muestran sus 24 bloques como "Disponible".
- **Reserva del propio usuario**: el usuario ve su propia reserva como bloque tomado y no puede duplicarla.
- **Límite de reserva activa**: un usuario con una reserva vigente no puede crear otra hasta que la cancele o la misma pase.
- **Cancelación de una reserva que ya inició**: no está permitida; el usuario solo puede cancelar reservas futuras.
- **Contraseña corta**: el registro rechaza las contraseñas de menos de 8 caracteres indicando el mínimo requerido.
- **Inicio de sesión con correo inexistente**: el mensaje de error debe ser indistinguible del de contraseña incorrecta.

## Requirements *(mandatory)*

### Functional Requirements

**Autenticación**

- **FR-001**: El sistema MUST permitir a un visitante registrarse con correo electrónico y contraseña.
- **FR-002**: El sistema MUST validar el formato del correo electrónico y exigir que la contraseña y su confirmación coincidan.
- **FR-003**: El sistema MUST exigir una contraseña de al menos 8 caracteres en el registro.
- **FR-004**: El sistema MUST rechazar el registro cuando el correo electrónico ya está registrado, sin distinción de mayúsculas y minúsculas.
- **FR-005**: El sistema MUST permitir a un usuario registrado iniciar sesión y cerrar sesión.
- **FR-006**: El sistema MUST rechazar el inicio de sesión con credenciales incorrectas con un mensaje genérico que no revele si el correo existe.
- **FR-007**: El sistema MUST mantener la sesión activa entre visitas mientras el usuario no la cierre explícitamente.
- **FR-008**: El sistema MUST mostrar al usuario sin sesión activa únicamente el listado de las 5 canchas y el calendario de fechas, sin exponer la grilla de horarios. El acceso a la grilla y a toda acción de reserva MUST exigir sesión activa.

**Catálogo y disponibilidad**

- **FR-009**: El sistema MUST listar exactamente cinco canchas: Cancha Laureles, Cancha El Poblado, Cancha Belén, Cancha Robledo y Cancha Envigado.
- **FR-010**: El catálogo de canchas MUST ser inmutable para los usuarios en esta iteración: ningún usuario puede crear, editar ni eliminar canchas.
- **FR-011**: El sistema MUST permitir al usuario seleccionar una fecha y consultar la disponibilidad de una cancha para esa fecha.
- **FR-012**: El sistema MUST presentar la disponibilidad como una grilla de 24 bloques horarios consecutivos de una hora cada uno.
- **FR-013**: El sistema MUST indicar en cada bloque si está "Disponible" o "Reservado".
- **FR-014**: El sistema MUST impedir la selección de bloques reservados por otros usuarios como destino de una reserva.
- **FR-015**: El sistema MUST actualizar la grilla cuando el usuario cambia de cancha o de fecha sin requerir una recarga manual de la página.

**Creación de reservas**

- **FR-016**: El sistema MUST permitir a un usuario con sesión activa seleccionar un bloque disponible y confirmar la reserva.
- **FR-017**: El sistema MUST re-validar la disponibilidad del bloque en el momento de confirmar la reserva, después de que el usuario haya visto el estado del bloque.
- **FR-018**: El sistema MUST rechazar la reserva cuando el bloque ya no está disponible, con un mensaje comprensible que explique el conflicto y no exponga detalles técnicos.
- **FR-019**: El sistema MUST rechazar la reserva de bloques cuya hora de inicio ya transcurrió.
- **FR-020**: El sistema MUST aceptar únicamente bloques de una hora completos y alineados a la hora.
- **FR-021**: El sistema MUST registrar cada reserva creada con usuario, cancha, fecha, hora de inicio y hora de fin.
- **FR-022**: El sistema MUST impedir que un usuario tenga más de una reserva vigente a la vez. Se considera vigente toda reserva que no ha sido cancelada y cuya fecha y hora aún no han transcurrido. Las reservas pasadas y las canceladas no cuentan para esta restricción.
- **FR-023**: El sistema MUST hacer visible la reserva recién creada para el resto de usuarios en la disponibilidad de esa cancha y fecha.

**Gestión de reservas propias**

- **FR-024**: El sistema MUST mostrar al usuario con sesión activa la lista de sus reservas futuras con nombre de cancha, fecha y hora.
- **FR-025**: El sistema MUST mostrar al usuario con sesión activa el historial de sus reservas pasadas con nombre de cancha, fecha y hora.
- **FR-026**: El sistema MUST permitir cancelar una reserva futura, previa confirmación explícita del usuario.
- **FR-027**: El sistema MUST impedir la cancelación de reservas ya iniciadas o pasadas.
- **FR-028**: El sistema MUST liberar el bloque horario de una reserva cancelada, dejándolo disponible para otros usuarios.
- **FR-029**: El sistema MUST impedir que un usuario vea, cancele o modifique reservas pertenecientes a otros usuarios.
- **FR-030**: El sistema MUST presentar los mensajes de error al usuario final en lenguaje comprensible, sin trazas ni detalles técnicos, y distinguir claramente el conflicto de horario de otros errores.

### Key Entities

- **Usuario**: persona registrada en el club. Atributos: correo electrónico (único, insensible a mayúsculas), contraseña, fecha de registro. Relación: posee reservas y una sesión activa.
- **Cancha**: espacio reservable del catálogo cerrado del club. Atributos: nombre. Relación: es el objeto reservado por las reservas.
- **Bloque horario**: unidad de una hora dentro de una fecha, con un estado derivado (disponible o reservado) a partir de las reservas de la cancha para esa fecha.
- **Reserva**: ocupación de un bloque horario de una cancha por parte de un usuario. Atributos: fecha, hora de inicio, hora de fin, estado (activa, cancelada o pasada). Relaciones: pertenece a un Usuario y a una Cancha. Existe como máximo una reserva activa por bloque de cancha.
- **Sesión**: estado de autenticación de un usuario, que habilita o bloquea las acciones que la requieren.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario nuevo completa el registro y el inicio de sesión en menos de 2 minutos sin asistencia.
- **SC-002**: El 100% de los intentos de reserva sobre un bloque ya ocupado por otro usuario se rechazan, y en ninguna situación existen dos reservas sobre el mismo bloque de la misma cancha.
- **SC-003**: El 95% de los usuarios encuentra la cancha, la fecha y el horario disponible que busca en menos de 60 segundos desde su panel.
- **SC-004**: El 100% de las reservas creadas tienen fecha y hora futuras al momento de la confirmación; ninguna reserva puede quedar en el pasado.
- **SC-005**: El 100% de las reservas creadas aparece en "Mis Reservas" con cancha, fecha y hora correctos, y es visible en menos de 1 segundo.
- **SC-006**: El 100% de las cancelaciones de reservas futuras libera el bloque y el mismo bloque vuelve a mostrarse como "Disponible" para otro usuario en menos de 5 segundos.
- **SC-007**: El 100% de las acciones de un usuario sobre reservas de terceros son rechazadas; ningún usuario puede ver ni cancelar reservas ajenas.
- **SC-008**: Al menos el 90% de los usuarios que intentan reservar completan la reserva al primer intento, sin errores técnicos visibles.
- **SC-009**: El 100% de los escenarios de error muestran un mensaje que identifica el problema y, cuando aplica, la acción que el usuario debe seguir.
- **SC-010**: Los cambios de disponibilidad se reflejan en pantalla sin que el usuario deba recargar la página manualmente.
- **SC-011**: El 100% de los bloques no seleccionables de una grilla (reservados o transcurridos) son identificados como tales por el usuario en una prueba de usabilidad con al menos 5 usuarios.

## Assumptions

- Los usuarios son jugadores del club con un correo válido y conexión a internet estable.
- La hora de referencia es la hora local del club; todas las comparaciones de "pasado" y "futuro" se hacen contra esa hora local.
- La grilla cubre las 24 horas del día; el horario comercial del club no restringe los bloques reservables en esta iteración.
- El registro es inmediato: no hay verificación por correo ni activación previa, porque el envío de correos está fuera del alcance.
- La recuperación de contraseña por correo no está en el alcance (no hay notificaciones externas); un usuario que olvide su contraseña deberá registrar una cuenta nueva.
- La sesión se mantiene activa hasta que el usuario cierra sesión explícitamente.
- Un usuario sin sesión ve el listado de las 5 canchas y el calendario, pero no la grilla de horarios; para consultar o reservar un turno debe iniciar sesión o registrarse.
- Un usuario puede tener un historial ilimitado de reservas pasadas y canceladas; la restricción de "una reserva vigente" solo aplica a las reservas vigentes, de modo que el usuario recupera su cupo al cancelar o cuando su reserva termina.
- El calendario permite elegir el día en curso y días futuros; las fechas pasadas no son seleccionables.
- Las canchas se consideran equivalentes en características (superficie, techado, iluminación); el usuario elige por nombre y disponibilidad.
- El club opera presencialmente: el pago de las reservas se realiza en el sitio, sin integración de medios de pago.
- El alcance de esta iteración es el descrito en la sección de User Stories; el listado de canchas no es administrable por ningún usuario.
