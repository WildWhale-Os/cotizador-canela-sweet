# quickstart.md

**Feature**: Autenticación por correo (001-email-auth)

## Prerequisites

- Node.js (version compatible with Next.js 16)
- A Supabase Postgres instance and connection string (set as `DATABASE_URL`)
- Environment: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` if needed for server

## Environment variables (example)

- DATABASE_URL=postgresql://<user>:<pass>@host:port/db
- NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
- SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
- NEXTAUTH_URL=http://localhost:3000
- NODE_ENV=development

> NOTE: Store secrets in a secure store (GitHub Actions secrets, Vercel environment,
> or local .env file for development). Do NOT commit secrets to source control.

## Local dev

1. Install dependencies

```bash
# Using npm
npm install

# or pnpm
pnpm install
```

2. Set the environment variables (e.g., copy `.env.example` → `.env` and fill values)

3. Run migrations (Drizzle)

```bash
# Example (depends on Drizzle setup)
npm run drizzle:migrate
```

4. Start dev server

```bash
npm run dev
```

5. Run tests

```bash
# Unit + integration
npm test

# e2e (Playwright)
npm run test:e2e
```

## Notes

- The spec requires tests (unit + integration + e2e) for P1 flows. Follow TDD: write tests first and
- ensure CI runs them on PRs.

***
