---
description: "Task list for feature 001-email-auth (email auth + password reset + admin user management)"
---

# Tasks: Autenticación por correo (email-auth)

**Input**: Design docs from `/specs/001-email-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/, research.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2) — only for story phases
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create Next.js 16 App Router foundation in `app/` and `components/` per plan (create `app/`, `components/`, `lib/`, `db/`, `tests/`) 
- [ ] T002 Initialize package manifest and tooling: add `package.json`, install Next.js 16, React, Drizzle, Better Auth, Shadcn/UI, React Hook Form, ArkType, Sonner, Vitest, Playwright (document exact versions) — update `package.json`
- [ ] T003 [P] Create `.env.example` with required variables (`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NODE_ENV`) at repository root
- [ ] T004 Add linting and formatting config files (ESLint, Prettier) and CI lint job placeholder in `.github/workflows/ci.yml`
- [ ] T005 [P] Add base CI workflow skeleton `.github/workflows/ci.yml` with steps: install, lint, test, coverage report (placeholders for integration/e2e jobs)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T006 Setup Drizzle DB client in `lib/db/client.ts` connecting to `process.env.DATABASE_URL`
- [ ] T007 [P] Create Drizzle schema files in `db/schema.ts` and initial migration in `db/migrations/001_init.sql` (users, password_reset_requests, user_invitations)
- [ ] T008 Implement Drizzle migration script entries in `package.json` (`drizzle-kit` commands) and document migration run in `quickstart.md`
- [ ] T009 [P] Create Better Auth integration module `lib/auth/better-auth.ts` with bootstrapping and helper functions (session creation, token verification) — stubbed for now
- [ ] T010 [P] Add logging/observability hooks in `lib/logging.ts` and ensure auth events will call them (login success/fail, password reset request, invitation sent)
- [ ] T011 Create ArkType schemas directory `lib/validation/auth.ts` and scaffold `loginSchema`, `resetSchema`, `invitationSchema`
- [ ] T012 [P] Add Sonner configuration wrapper `components/sonner.tsx` for toasts
- [ ] T013 [P] Add Shadcn/UI theme wrapper and base components in `components/ui/` (Form, Input, Button wrappers)
- [ ] T014 Create Drizzle seed script to create admin user placeholder (use env override) in `db/seed/admin-seed.ts` (document in quickstart)
- [ ] T015 [P] Add test harness configuration: Vitest config `vitest.config.ts`, Testing Library setup `tests/setup.ts`, Playwright config `playwright.config.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Iniciar sesión con correo y contraseña (Priority: P1) 🎯 MVP

**Goal**: Login form, Server Action auth flow, session management, success and error handling UI

**Independent Test**: Unit tests for validation + auth helpers; integration tests for Server Action; Playwright e2e verifying full flow.

### Tests (TDD-first)
- [ ] T016 [US1] Write unit tests for `lib/validation/auth.ts::loginSchema` in `tests/unit/validation/auth.test.ts`
- [ ] T017 [US1] Write unit tests for Better Auth helper stubs in `tests/unit/lib/auth.test.ts` (expect login success/failure behaviors)
- [ ] T018 [US1] Write integration test for Server Action `app/(auth)/login/route.test.ts` to simulate login POST (mock DB/Better Auth) — place in `tests/integration/`
- [ ] T019 [US1] Add Playwright e2e test `tests/e2e/login.spec.ts` verifying login UI, spinner behavior, success redirect to `/dashboard`

### Implementation
- [ ] T020 [US1] Create controlled login form UI `app/(auth)/login/page.tsx` using React Hook Form + Shadcn components and connect to ArkType validation at input layer
- [ ] T021 [US1] Implement Server Action for login `app/(auth)/login/action.ts` that: validates input (ArkType), authenticates via `lib/auth/better-auth.ts`, sets session cookie, returns success/failure; ensure spinner/disabled button behavior in UI
- [ ] T022 [US1] Implement session handling helpers in `lib/auth/session.ts` (createSession, getSession, revokeSession)
- [ ] T023 [US1] Implement client-side toast notifications integration (Sonner) in login flow for success/error
- [ ] T024 [US1] Add route-level server-side guard for `/dashboard` that checks session and redirects to login if absent (middleware or server component guard in `app/dashboard/page.tsx`)
- [ ] T025 [US1] Implement unit tests for `lib/auth/session.ts` in `tests/unit/lib/session.test.ts`
- [ ] T026 [US1] Update CI to run US1 integration tests and block merging if failing (edit `.github/workflows/ci.yml` to include integration step)

**Checkpoint**: Login flow implemented and testable independently

---

## Phase 4: User Story 2 - Recuperación de contraseña (Priority: P1)

**Goal**: Password reset request + token flow + reset form

**Independent Test**: Integration test covering request-reset → token issuance → reset flow; e2e test for user-facing flow.

### Tests
- [ ] T027 [US2] Unit tests for `lib/validation/auth.ts::resetSchema` in `tests/unit/validation/reset.test.ts`
- [ ] T028 [US2] Integration test for `POST /api/auth/request-reset` in `tests/integration/auth.request-reset.test.ts` (assert token created and email queued)
- [ ] T029 [US2] Playwright e2e `tests/e2e/reset.spec.ts` to validate request reset and complete reset via link

### Implementation
- [ ] T030 [US2] Implement API route Server Action `app/api/auth/request-reset/route.ts` that accepts email, creates `PasswordResetRequest` row, queues email send (use a local queue or mockable email service), return generic response
- [ ] T031 [US2] Implement email templating in `lib/email/templates/reset-password.html` and email queue worker `lib/email/queue.ts` (stub in dev)
- [ ] T032 [US2] Implement reset link page `app/(auth)/reset/[token]/page.tsx` with Server Action `app/(auth)/reset/[token]/action.ts` to validate token and update password (ArkType validation)
- [ ] T033 [US2] Implement token validation and consumption logic in `lib/auth/reset.ts` (single-use token, mark used_at)
- [ ] T034 [US2] Add tests for reset token logic `tests/unit/lib/reset.test.ts`
- [ ] T035 [US2] Ensure Observability: log reset request and reset completion in `lib/logging.ts`

**Checkpoint**: Password reset flow implemented and testable

---

## Phase 5: User Story 3 - Dashboard y gestión de usuarios (Priority: P2)

**Goal**: Admin dashboard area with user listing and create/invite/edit user flows (invitation link flow)

**Independent Test**: Admin e2e test creating user and validating invitation flow; integration tests for admin endpoints.

### Tests
- [ ] T036 [US3] Unit tests for admin controllers/helpers in `tests/unit/lib/admin.test.ts`
- [ ] T037 [US3] Integration tests for admin endpoints `tests/integration/admin.users.test.ts`
- [ ] T038 [US3] Playwright e2e `tests/e2e/admin-invite.spec.ts` verifying invite flow and new user onboarding

### Implementation
- [ ] T039 [US3] Create admin users page `app/dashboard/admin/users/page.tsx` with Shadcn UI components and server-side authorization check (Better Auth)
- [ ] T040 [US3] Implement `POST /api/admin/invite` Server Action `app/api/admin/invite/route.ts` (admin-only) to create `UserInvitation`, queue email and return generic response
- [ ] T041 [US3] Implement admin API `app/api/admin/users/route.ts` for list/create/edit/disable operations (guarded by Better Auth)
- [ ] T042 [US3] Implement service layer `lib/services/userService.ts` to encapsulate user creation, role assignment and invitation creation
- [ ] T043 [US3] Add tests for userService `tests/unit/lib/userService.test.ts`

**Checkpoint**: Admin user management implemented and testable

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T044 [P] Documentation updates: update `specs/001-email-auth/quickstart.md`, README and component docs in `docs/`
- [ ] T045 [P] Add runbook `docs/runbook/auth-incident.md` for handling lockouts, token compromise, email failures
- [ ] T046 [P] Performance & load testing: add basic load test for dashboard endpoints and auth endpoints (script in `tests/load/`)
- [ ] T047 [P] Security hardening: add SAST/security-linting step in CI and document secrets rotation procedures
- [ ] T048 [P] Code cleanup and refactor (address lint warnings and complexity metrics)
- [ ] T049 [P] Final e2e smoke test job in CI that runs Playwright against a staging environment

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: T001-T005 — start immediately
- **Foundational (Phase 2)**: T006-T015 — BLOCKS all user stories
- **User Story 1 (P1)**: T016-T026 — depends on Foundational
- **User Story 2 (P1)**: T027-T035 — depends on Foundational
- **User Story 3 (P2)**: T036-T043 — depends on Foundational and US1/US2 where appropriate

## Parallel Opportunities

- T002, T003, T004, T005 can run in parallel (package + config)
- DB client (T006) and Drizzle schema (T007) can be worked in parallel with validation schema (T011)
- Many tests (unit) can be developed in parallel with implementation tasks marked [P]

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 + Phase 2 foundational tasks
2. Implement User Story 1 tasks (T016-T026) with tests first
3. Validate CI gates and merge
4. Proceed with User Story 2 and 3 in priority order

### Incremental Delivery
1. Implement US1 → merge → release internal staging
2. Implement US2 → verify email infra and e2e
3. Implement US3 (admin) → finalize RBAC and invitation flow

---

## Task counts & summary

- Total tasks: 49
- Tasks per story: US1: 11 (T016-T026), US2: 9 (T027-T035), US3: 8 (T036-T043), Setup/Foundation/Polish: 21 (T001-T015, T044-T049)

---

## Notes

- All tasks include exact file paths where code should be added. Tests are included for P1 and P2 per constitution and spec.
- If you want I can now commit this `tasks.md` to `001-email-auth` and push it (recommended).
