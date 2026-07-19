# Deployment

The two applications deploy independently from `main`:

- Vercel runs the Hono API as an Edge Function through `api/index.ts`.
- Cloudflare Pages serves the static Vite frontend from `dist`.
- Supabase stores contact messages; only the Vercel API receives the service-role key.

## Vercel API

Create a Vercel project for this repository and configure these Production environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS`: the Cloudflare Pages/custom frontend origins, comma-separated.

Create the GitHub environment `production-vercel-api` with:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Requests under `/api/*` are rewritten to the Hono function. After deployment,
verify `https://YOUR_API_PROJECT.vercel.app/api/health`.

## Cloudflare Pages frontend

Create a Pages project named `bayjf-portfolio`. Create the GitHub environment
`production-cloudflare-pages` with secrets:

- `CLOUDFLARE_API_TOKEN`: scoped for Cloudflare Pages edit access.
- `CLOUDFLARE_ACCOUNT_ID`

Add the environment variable `VITE_API_URL` to that GitHub environment, for
example `https://YOUR_API_PROJECT.vercel.app/api`. It is intentionally a
GitHub environment variable rather than a secret because it is embedded into
the public browser bundle.

Optional analytics variables in the same GitHub environment:

- `VITE_GA_MEASUREMENT_ID`: Google Analytics 4 measurement ID (`G-...`).
- `VITE_CLARITY_PROJECT_ID`: Microsoft Clarity project ID.

When omitted, the corresponding analytics script is not loaded. These public
project identifiers are variables, not secrets.

Never create a `VITE_` variable containing a Supabase service-role key.

## Database and release

1. Apply `supabase/migrations/20260719000000_create_contact_messages.sql`.
2. Configure and deploy the Vercel API first.
3. Put the resulting Vercel `/api` URL in Cloudflare's `VITE_API_URL` variable.
4. Put the resulting Cloudflare frontend origin in Vercel's `ALLOWED_ORIGINS`.
5. Run both deployment workflows manually once, or merge to `main`.

Pull requests and pushes to `main` run typechecking, unit/component coverage,
the production build, and Playwright tests before release.
