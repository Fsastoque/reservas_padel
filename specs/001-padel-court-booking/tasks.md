# Tasks: Sistema de Reservas de Pádel

**Input**: Design documents from `/specs/001-padel-court-booking/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`, `db/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per plan.md

- [X] T001 Create project structure per implementation plan in repository root (`frontend/`, `backend/`, `db/` directories with subdirs)
- [X] T002 [P] Initialize backend with Node.js + TypeScript + Express in `backend/package.json`, `backend/tsconfig.json`
- [X] T003 [P] Initialize frontend with React + Vite + TypeScript + Tailwind CSS in `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tailwind.config.*`
- [X] T004 [P] Add backend dependencies (`express`, `better-sqlite3`, `bcryptjs`, `express-session` or cookie session, `cors`, `dotenv`) in `backend/package.json`
- [X] T005 [P] Add frontend dependencies (`react`, `react-dom`, `react-router-dom`, `axios`, `tailwindcss`) in `frontend/package.json`
- [X] T006 [P] Configure linting/formatting (.eslintrc, .prettierrc) for backend and frontend
- [X] T007 Create `.gitignore` entries for `padel.db`, `node_modules/`, `dist/` (verify/update root `.gitignore`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. Blocks all stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create database schema in `db/schema.sql` with tables `usuarios` (email unique, password_hash, created_at), `canchas` (5 static), `reservas` (user_id, court_id, reservation_date, start_hour, end_hour, status, created_at, cancelled_at) with UNIQUE(court_id, reservation_date, start_hour), `sesiones` (id, user_id, data, expires_at, created_at) and indexes
- [X] T009 Create DB initialization script in `backend/src/config/db.ts` using better-sqlite3 to open `db/padel.db` and apply schema
- [X] T010 [P] Seed 5 canchas in `db/seed.sql` (Cancha Laureles, Cancha El Poblado, Cancha Belén, Cancha Robledo, Cancha Envigado) and apply on init if empty
- [X] T011 [P] Implement auth/session middleware in `backend/src/middlewares/auth.ts` (requireAuth, attachUser) using httpOnly cookie session
- [X] T012 [P] Implement error handler middleware in `backend/src/middlewares/errorHandler.ts` returning friendly messages without stack traces, mapping to 400/401/409
- [X] T013 [P] Setup Express app structure in `backend/src/app.ts` with CORS, json, session/cookies, routes mounting, error handler
- [X] T014 [P] Create shared types in `backend/src/types/` and `frontend/src/types/` (User, Court, Reservation, Block)
- [X] T015 [P] Setup frontend API client in `frontend/src/services/api.ts` with axios and cookie handling
- [X] T016 [P] Setup frontend routing in `frontend/src/App.tsx` with routes for auth, courts, booking, my-reservations

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Registrarse e iniciar sesión (Priority: P1) 🎯 MVP

**Goal**: Visitors can register/login with email+password, session management, auth gates
**Independent Test**: Register new user, logout, login again; reject duplicate email, wrong creds (generic), invalid format/password mismatch

### Implementation for User Story 1

- [X] T017 [P] [US1] Create Usuario model/service helpers in `backend/src/services/authService.ts` (normalize email lowercase, hash password with bcryptjs, validate email format, validate password >=8, compare hashes)
- [X] T018 [P] [US1] Implement auth routes/controllers in `backend/src/routes/auth.ts`, `backend/src/controllers/authController.ts` for POST `/api/auth/register`, POST `/api/auth/login`, POST `/api/auth/logout`
- [X] T019 [US1] Wire auth routes in `backend/src/app.ts` and enforce session creation on register/login
- [X] T020 [P] [US1] Create auth pages in `frontend/src/pages/Login.tsx`, `frontend/src/pages/Register.tsx` with form validation and friendly error messages
- [X] T021 [P] [US1] Create auth context/hook in `frontend/src/hooks/useAuth.tsx` to manage session state
- [X] T022 [US1] Add auth guards in `frontend/src/components/AuthGuard.tsx` and integrate with routes

**Checkpoint**: User Story 1 complete - auth working independently

---

## Phase 4: User Story 2 - Explorar canchas y consultar disponibilidad (Priority: P1)

**Goal**: List 5 courts, calendar, 24h grid with Available/Reserved; guests see only courts+calendar; auth required for grid
**Independent Test**: Guest sees courts+calendar only; logged in user sees grid, status correct, changes update on court/date change

### Implementation for User Story 2

- [X] T023 [P] [US2] Create courts service in `backend/src/services/courtsService.ts` returning the 5 static courts
- [X] T024 [P] [US2] Create availability service in `backend/src/services/availabilityService.ts` to generate 24 blocks for (courtId, date) using local time, mark reserved if active reservation exists
- [X] T025 [US2] Implement routes/controllers for GET `/api/courts` (public) and GET `/api/availability` (requires auth) in `backend/src/routes/courts.ts`, `backend/src/routes/availability.ts`, `backend/src/controllers/*`
- [X] T026 [P] [US2] Create courts list page in `frontend/src/pages/Courts.tsx` showing 5 courts and date picker (calendar)
- [X] T027 [P] [US2] Create availability grid component in `frontend/src/components/AvailabilityGrid.tsx` showing 24 blocks with Available/Reserved styling
- [X] T028 [US2] Create booking page in `frontend/src/pages/Booking.tsx` combining courts+calendar+grid, redirect guests to login when trying to view grid
- [X] T029 [US2] Wire routes in frontend and ensure grid updates on court/date change

**Checkpoint**: User Story 2 complete - availability visible correctly by auth state

---

## Phase 5: User Story 3 - Crear una reserva (Priority: P1)

**Goal**: Book available block with re-validation, prevent double-booking (409), enforce 1 active/vigente reservation, block past times
**Independent Test**: Book free block → reservation created; concurrent booking of same block → one succeeds other gets 409; booking with existing vigente reservation → rejected; past block rejected

### Implementation for User Story 3

- [X] T030 [P] [US3] Create reservations service in `backend/src/services/reservationsService.ts` with helpers: isVigente(userId), hasVigenteReservation(userId), isBlockPast(date,hour), validateBooking
- [X] T031 [US3] Implement atomic booking in `backend/src/services/reservationsService.ts` using `BEGIN IMMEDIATE` transaction, check past/time, check vigente reservation, check existing reservation (UNIQUE), INSERT with status 'active', map UNIQUE violation to 409 friendly message
- [X] T032 [US3] Implement routes/controllers for POST `/api/reservations` in `backend/src/routes/reservations.ts`, `backend/src/controllers/reservationsController.ts` (require auth, return 400/401/409)
- [X] T033 [P] [US3] Add booking action to AvailabilityGrid in `frontend/src/components/AvailabilityGrid.tsx` (select available block, confirm)
- [X] T034 [US3] Add booking API call in `frontend/src/services/reservationsApi.ts` and handle 409 with friendly message, refresh grid on success
- [X] T035 [US3] Show user's vigente reservation info when trying to book second time

**Checkpoint**: User Story 3 complete - bookings work with collision prevention

---

## Phase 6: User Story 4 - Gestionar mis reservas (Priority: P2)

**Goal**: View upcoming and past reservations, cancel future reservations with confirmation, free block on cancel, users only see own reservations
**Independent Test**: View split lists (futuras/historial) with court/date/hour; cancel future → removed from upcoming, block freed; cannot cancel past/in-progress; cannot access others' reservations

### Implementation for User Story 4

- [X] T036 [P] [US4] Extend reservations service in `backend/src/services/reservationsService.ts` with getUserReservations(userId) splitting upcoming/past, cancelReservation(reservationId, userId) validating ownership and future
- [X] T037 [US4] Implement GET `/api/reservations` and POST `/api/reservations/:id/cancel` in controllers/routes (require auth, enforce ownership)
- [X] T038 [P] [US4] Create My Reservations page in `frontend/src/pages/MyReservations.tsx` showing upcoming and past lists with court/name/date/hour
- [X] T039 [US4] Add cancel action with confirmation dialog in `frontend/src/pages/MyReservations.tsx` calling cancel API and refreshing
- [X] T040 [US4] Update availability after cancel (grid reflects freed block)

**Checkpoint**: All user stories functional independently

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validation across all stories

- [X] T041 [P] Ensure all API errors return friendly Spanish messages without stack traces (verify errorHandler)
- [X] T042 [P] Validate all protected routes require auth and return 401 appropriately
- [X] T043 [P] Ensure courts are exactly the 5 static courts (no CRUD exposed)
- [X] T044 [P] Add basic styling with Tailwind CSS for clean UI
- [X] T045 Run quickstart.md validation scenarios end-to-end
- [X] T046 Verify Constitution compliance (structure, no ORMs, no forbidden features, HTTP codes)

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational; can proceed in priority order P1→P1→P1→P2 or in parallel if capacity allows
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies
- **US1 (P1)**: After Foundational - independent
- **US2 (P1)**: After Foundational - independent (uses courts)
- **US3 (P1)**: After Foundational - depends on US1/US2 concepts but independently testable
- **US4 (P2)**: After Foundational - independent

### Parallel Opportunities
- Setup tasks T002-T006 can run in parallel
- Foundational T011-T016 can run in parallel
- Within stories, models/services/components marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Stories 1,2,3)
1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational) - CRITICAL
3. Complete Phase 3 (US1), Phase 4 (US2), Phase 5 (US3)
4. Validate booking flow end-to-end
5. Demo MVP

### Incremental Delivery
1. Setup + Foundational → foundation ready
2. Add US1 → auth works
3. Add US2 → availability works
4. Add US3 → booking works (MVP core)
5. Add US4 → manage reservations
6. Polish

---

## Notes
- All tasks follow checklist format with IDs, [P] where parallelizable, [Story] for story phases
- Use TypeScript throughout, functional style, no classes unless necessary
- Follow constitution strictly (no ORMs, flat structure, friendly errors)
- Use transactions + UNIQUE for collision prevention
- Guests see only courts+calendar per FR-008
- Max 1 vigente reservation per user per FR-022
