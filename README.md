# BayJF

React 19 + Vite BayJF frontend with a Hono API on Vercel and
Supabase persistence for contact messages.

## Architecture

- Frontend: React, Tailwind CSS, Motion and Recharts; deployed to Cloudflare Pages.
- API: Hono running as a Vercel Edge Function.
- Database: Supabase Postgres with RLS; only the Vercel API service role can insert.
- Quality: TypeScript, Vitest, Testing Library and Playwright.
- Delivery: GitHub Actions deploys the frontend and API independently.
- Analytics: optional Google Analytics 4 and Microsoft Clarity integrations.

## Local development

Requirements: Node.js 22 and a Supabase project.

```bash
npm ci
cp .env.example .env.local
npm run dev:api
```

In another terminal:

```bash
npm run dev
```

Apply [the Supabase migration](supabase/migrations/20260719000000_create_contact_messages.sql)
before submitting the contact form. The frontend runs at `http://localhost:3000`
and proxies `/api` to the local Vercel API at `http://localhost:8787`.

Vercel's local server reads `.env.local`. Vite only exposes variables prefixed
with `VITE_`, so never prefix the Supabase service-role key with `VITE_`.

## Verification

```bash
npm run lint
npm test
npm run test:coverage
npm run test:e2e
npm run build
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for Cloudflare, Vercel and GitHub Secrets setup.
