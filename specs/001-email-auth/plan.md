# Implementation Plan: Autenticación por correo (email-auth)

**Branch**: `001-email-auth` | **Date**: 2025-11-09 | **Spec**: `specs/001-email-auth/spec.md`  
**Input**: Feature specification from `specs/001-email-auth/spec.md`

## Summary

Implementar el flujo de autenticación por correo y contraseña en una aplicación Next.js 16
usando App Router. La implementación incluirá: formulario de login con React Hook Form y
validación ArkType, Server Action de Next.js para la autenticación, notificaciones con
Sonner, UI con Shadcn/UI (React Server Components cuando aplique), persistencia en
Supabase (Postgres) mediante Drizzle ORM, y la integración de Better Auth con su plugin
de administración para la autorización y gestión de usuarios. Se priorizan pruebas TDD
(unit + integration + e2e) y gates de CI que verifiquen lint, tests y coverage >= 80%.

## Technical Context

**Language/Version**: Next.js 16 (Node.js runtime compatible con Next.js 16)  
**Primary Dependencies**:

- Next.js 16 (App Router, Server Actions)  
- Drizzle ORM (Postgres client / query builder)  
- Better Auth + Better Auth Admin plugin  
- Shadcn/UI (component library)  
- React Hook Form (forms)  
- ArkType (input validation)  
- Sonner (toasts/notifications)  
- Vitest (unit tests) + Testing Library (component tests)  
- Playwright (end-to-end tests)

**Storage**: Supabase PostgreSQL (self-managed instance). Connection string provided by
the user — MUST be stored in environment variables (e.g., `DATABASE_URL`) and never
hard-coded in source. Path: `env.DATABASE_URL`.

## Integration patterns & implementation notes

These are concrete integration patterns discovered during research and recommended for this feature:

- Better Auth + Next.js
  - Use Better Auth as the authentication engine and include the `nextCookies()` plugin so Server Actions that call the Better Auth API will set cookies automatically.
  - Mount the Better Auth handler at `app/api/auth/[...all]/route.ts` using the provided Next adapter (e.g., `toNextJsHandler(auth)`).
  - Use `auth.api.signInEmail({ body })` inside Server Actions to perform sign-in; errors should be mapped to safe, generic messages for the UI.

- Drizzle ORM (app data)
  - Use Drizzle for app tables and migrations while letting Better Auth manage its own auth tables in the same Postgres instance.
  - Create a thin Drizzle client in `lib/db.ts` using `pg` Pool + `drizzle(pool)` and reuse it in service layers.
  - Keep Better Auth tables read-only from your app where possible; reference `session.user.id` from Better Auth to join app profiles.

- ArkType + React Hook Form
  - Define ArkType schemas once in `app/(auth)/schema.ts` and reuse them on client and server.
  - On the client use `react-hook-form` with an ArkType resolver (via `@hookform/resolvers/*` or a small adapter) or map ArkType errors to `setError` manually.
  - Validate again on the server inside Server Actions using the same ArkType schema.

- Server Actions pattern
  - Server Actions are the recommended mutation surface for login flows; implement a `loginAction` in `app/(auth)/login/actions.ts` marked with `"use server"`.
  - The action should: validate input (ArkType), call `auth.api.signInEmail`, and return a compact result object that the client form can use to show errors or redirect.

- Cookie & security defaults (enforce in CI & review)
  - Cookies set by Better Auth via `nextCookies()` must be `httpOnly: true`, `secure: true` in production, and `sameSite: "lax"` (or `strict` if justified).
  - If additional persistent cookies (remember-me) are used, set `httpOnly`, `secure`, `sameSite`, `path: '/'` and explicit `maxAge` consistent with `FR-009`.

### Testing & environments

- Unit: ArkType schemas, small helpers (session helpers) and service functions mocked.
- Integration: spin up test Postgres (Docker) and run Better Auth's migrations, then test Server Actions via route handlers or a controlled server harness.
- E2E: Playwright tests visiting `/login`, submitting valid/invalid credentials, verifying redirect and error message parity.

These patterns will be translated into explicit tasks in `tasks.md` (bootstrapping files, Server Action, ArkType schemas, Drizzle client, tests and CI changes).

**Testing**: Vitest for unit, Testing Library for component tests, Playwright for e2e.
CI must run linters, unit tests, integration tests and report coverage. Coverage gate: 80% for
critical modules (auth flows).

**Target Platform**: Default deployment target: Vercel (recommended for Next.js). If the
team requires a different host (self-hosted, Docker, other cloud), mark as NEEDS CLARIFICATION.

**Project Type**: Web application (Next.js monorepo-style app). Source layout will follow
Next.js conventions (`app/`, `components/`, `lib/`, `db/`).

**Performance Goals**: p95 < 200ms for dashboard API endpoints under expected load; auth
endpoints should respond within p95 < 300ms in production. (Adjust after load testing.)

**Constraints**: Secrets must be delivered via environment variables and the project must
adhere to the Constitution gates: lint + tests + coverage in CI, observability hooks (logging,
metrics) for auth events.

**Scale/Scope**: MVP scope: admin + regular users, single-tenant initial deployment.

## Constitution Check

GATES (from `.specify/memory/constitution.md`):

- Linting/formatting automated in CI — MUST pass.  
- Unit tests and integration/contract tests for auth flows — MUST be included before merge.  
- Coverage target: >= 80% for auth-critical components — MUST be enforced in CI (or
  justified in PR).  
- Observability: auth events (login success/fail, password resets, admin actions) MUST be
  logged and available for investigation.

Status: This plan adheres to the constitutional gates; tests and CI gates are included in
the Phase 2 tasks below.

## Project Structure

### Documentation (this feature)

```text
specs/001-email-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # API contracts (OpenAPI YAML)
└── tasks.md             # Phase 2 output (to be created)
```

### Source Code (repository root - Next.js 16 App Router layout)

```text
app/                    # Next.js App Router (pages replaced by app/)
├── (auth)/              # Auth routes (login, reset, invitation) as server actions and RSCs
├── dashboard/           # Dashboard and admin UI (RSC + client components)
components/             # Shared UI components (Shadcn wrappers)
lib/
├── auth/                # auth helpers (Better Auth integration, session helpers)
├── db/                  # Drizzle ORM client and models
└── validation/          # ArkType schemas
db/
├── migrations/          # Drizzle migrations
tests/
├── unit/
├── integration/
└── e2e/                 # Playwright tests
```

**Structure Decision**: Use a single Next.js application with clear separation: `app/` for
routes and RSCs, `components/` for UI, `lib/db` for Drizzle models. Admin UI lives under
`app/dashboard/admin` and will guard routes via server-side authorization checks (Better Auth).

## Phase 0: Outline & Research

### Unknowns / NEEDS_CLARIFICATION (resolved in research below)

1. Better Auth + Better Auth Admin plugin integration patterns with Next.js 16 Server Actions and Drizzle ORM — RESEARCHED and supported.
2. Recommended testing stack for RSC + Server Actions (Vitest + Testing Library + Playwright) — DECIDED.
3. Deployment target: default to Vercel but allow change (NEEDS_CLARIFICATION if you require another target).

### Research tasks (Phase 0)

- Research 1: Integration pattern for Better Auth with Next.js Server Actions and Drizzle ORM (supabase as DB).  
- Research 2: ArkType usage on Server Actions and integration with React Hook Form for client-side validation.  
- Research 3: Best practices for sending password reset emails securely (single-use tokens, expiration, throttling).  
- Research 4: Test strategy for Server Actions and RSCs (unit vs integration vs e2e setup).  

## Phase 1: Design & Contracts (high-level deliverables)

### Data model (outputs to be created in `data-model.md`):

- User (id, email, password_hash, roles, is_active, created_at, updated_at)
- PasswordResetRequest (token, user_id, created_at, expires_at, used_at)
- UserInvitation (token, inviter_id, email, created_at, expires_at, used_at)

### API Contracts (to generate in `/specs/001-email-auth/contracts/`):

- POST /api/auth/login — body: { email, password } → 200 on success (session cookie) / 401 generic error message
- POST /api/auth/request-reset — body: { email } → 200 (generic response)
- POST /api/auth/reset — body: { token, newPassword } → 200 on success
- POST /api/admin/invite — admin-only: { email } → 200 (invitation queued)
- GET /api/admin/users — admin-only: list users
- POST /api/admin/users — admin-only: create user (returns invitation flow)

### Quickstart (to generate `quickstart.md`):

- env: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NODE_ENV`  
- local steps: install deps, set env, run migrations, run dev server

### Agent context update

Will run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot` after generating artifacts to update any agent-specific context.

## Complexity Tracking

No constitution violations identified. All gates will be enforced by CI. If during Phase 1 any violation is discovered (for example, inability to exercise integration tests in CI), the plan will record the issue and propose mitigations.

## Phase 2: Implementation planning (summary)

Phase 2 will convert the deliverables into `tasks.md` (implementation tasks) organized by user story and including TDD-first tasks for tests, migrations, API, UI, and CI gates.

**IMPL_PLAN path**: C:\Users\Tomas\Documents\proyectos\cotizador-canela-sweet\specs\001-email-auth\plan.md

*** End Patch
