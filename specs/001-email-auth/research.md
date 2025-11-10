# research.md

**Feature**: Autenticación por correo (001-email-auth)
**Date**: 2025-11-09

## Decisions

### 1) Better Auth + Better Auth Admin plugin integration

Decision: Integrate Better Auth as the primary authentication/authorization layer and
use the Better Auth Admin plugin to provide in-app admin management. Server Actions in
Next.js 16 will call Better Auth server helpers to create sessions and validate tokens.

Rationale: Better Auth (per provided context) supports Next.js Server Actions and
provides first-class admin plugin to simplify user management. Using it reduces
custom auth surface area and leverages the plugin for authorization checks in server
components.

Alternatives considered:
- Implement custom session management with JWT/cookie handling (more work, more surface area).

---

### 2) Validation & Forms

Decision: Use ArkType for schema validation on the server (Server Actions) and React
Hook Form on the client. Client side will run ArkType via lightweight validation or
using a shared schema to ensure parity.

Rationale: ArkType provides composable, runtime-checkable schemas that can be used
both client and server (avoiding drift). React Hook Form integrates well with
Shadcn UI components.

Alternatives considered:
- Zod (wider adoption) — ArkType chosen per user requirement.

---

### 3) Drizzle ORM + Supabase

Decision: Use Drizzle ORM for database modeling and migrations; connect to Supabase
Postgres using `DATABASE_URL` env var. Use Drizzle migrations to manage schema.

Rationale: Drizzle works well with Postgres and provides type-safe queries. Supabase
is the provided storage backend.

Alternatives considered:
- Prisma — not chosen per user requirement.

---

### 4) Testing approach

Decision: Vitest + Testing Library for unit/component tests; Playwright for e2e tests.
CI will run unit + integration + e2e where possible (e2e in integration environments).

Rationale: Vitest is fast and integrates with Vite-based Next.js setups; Playwright
provides reliable cross-browser e2e testing.

---

### 5) Session & Invitation flows

Decision: Default session expiration set to 8 hours of inactivity. Implement optional
"remember me" that creates a longer-lived session (30 days) revocable by admin/user.
Admin-created users will receive a single-use invitation link (24h expiry) to set
password and verify email.

Rationale: Balances UX and security per your answers.

Alternatives considered:
- Immediate activation for admin-created accounts (less secure)

---

## Action items (research -> implementation)

- Document Better Auth server setup and how to invoke session creation in Server Actions.
- Create ArkType schemas that can be shared between client and server.
- Draft Drizzle schema and initial migration for users/password reset/invitations.
- Prepare Playwright test harness with staged supabase test DB.

***
