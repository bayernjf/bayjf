# Cloudflare API Proxy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route the BayJF contact API through a same-origin Cloudflare Pages Worker while retaining the Hono API on Vercel.

**Architecture:** Vite builds the React site and an esbuild-bundled Pages Worker into `dist`. The Worker serves static assets by default and proxies only `/api/*` to `API_BASE_URL`. The browser client uses the relative `/api` base, so browser code no longer embeds a Vercel hostname.

**Tech Stack:** React 19, TypeScript, Vite 6, esbuild, Vitest, Cloudflare Pages Workers, Vercel Edge/Hono, Supabase.

---

### Task 1: Add a testable Pages API proxy Worker

**Files:**
- Create: `worker/index.ts`
- Create: `worker/index.test.ts`

- [ ] **Step 1: Write failing Worker tests**

```ts
import { describe, expect, it, vi } from 'vitest';
import { handleRequest } from './index';

const assets = { fetch: vi.fn(() => new Response('asset')) };
const env = { ASSETS: assets, API_BASE_URL: 'https://api.example.com' };

describe('Pages API proxy', () => {
  it('delegates non-API requests to static assets', async () => {
    const response = await handleRequest(new Request('https://site.example/assets/app.js'), env);
    expect(await response.text()).toBe('asset');
    expect(assets.fetch).toHaveBeenCalledOnce();
  });

  it('forwards API requests to the configured upstream without infrastructure headers', async () => {
    const fetchSpy = vi.fn(() => new Response(JSON.stringify({ ok: true }), { status: 201 }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await handleRequest(new Request('https://site.example/api/contact?source=site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Host: 'site.example', 'CF-Ray': 'ray-id' },
      body: '{"name":"Ada"}',
    }), env);
    const upstream = fetchSpy.mock.calls[0][0] as Request;
    expect(upstream.url).toBe('https://api.example.com/api/contact?source=site');
    expect(upstream.headers.get('host')).toBeNull();
    expect(upstream.headers.get('cf-ray')).toBeNull();
    expect(response.status).toBe(201);
  });

  it('returns 502 without leaking details when the upstream is missing or unreachable', async () => {
    const missing = await handleRequest(new Request('https://site.example/api/health'), { ASSETS: assets });
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('internal upstream detail'))));
    const unreachable = await handleRequest(new Request('https://site.example/api/health'), env);
    expect(missing.status).toBe(502);
    expect(unreachable.status).toBe(502);
    expect(await unreachable.text()).not.toContain('internal upstream detail');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- worker/index.test.ts`

Expected: FAIL because `worker/index.ts` does not exist.

- [ ] **Step 3: Implement the minimal Worker**

```ts
export interface PagesEnv {
  ASSETS: Fetcher;
  API_BASE_URL?: string;
}

function unavailable() {
  return Response.json({ error: 'API_UNAVAILABLE', message: 'The API service is temporarily unavailable.' }, { status: 502 });
}

export async function handleRequest(request: Request, env: PagesEnv): Promise<Response> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
  if (!env.API_BASE_URL) return unavailable();

  try {
    const target = new URL(`${url.pathname}${url.search}`, env.API_BASE_URL);
    const headers = new Headers(request.headers);
    for (const header of ['host', 'cf-connecting-ip', 'cf-ray', 'cf-visitor', 'cf-worker']) headers.delete(header);
    const upstream = await fetch(new Request(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    }));
    const responseHeaders = new Headers(upstream.headers);
    for (const header of ['content-encoding', 'set-cookie', 'access-control-allow-credentials']) responseHeaders.delete(header);
    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
  } catch {
    return unavailable();
  }
}

export default { fetch: (request: Request, env: PagesEnv) => handleRequest(request, env) };
```

- [ ] **Step 4: Run the Worker tests to verify they pass**

Run: `npm test -- worker/index.test.ts`

Expected: PASS with all three Worker behaviors covered.

- [ ] **Step 5: Commit the Worker implementation and tests**

```bash
git add worker/index.ts worker/index.test.ts
git commit -m "feat(proxy): add Pages API worker" -m "Proxy same-origin API requests to the Vercel service."
```

### Task 2: Make production builds include the Worker and use the same-origin client endpoint

**Files:**
- Modify: `package.json`
- Modify: `src/api/contact.ts`
- Create: `src/api/contact.test.ts`

- [ ] **Step 1: Write the failing client endpoint test**

```ts
import { describe, expect, it, vi } from 'vitest';
import { submitContactMessage } from './contact';

describe('submitContactMessage', () => {
  it('posts contact messages to the same-origin API path', async () => {
    const fetchSpy = vi.fn(() => Promise.resolve(new Response(null, { status: 201 })));
    vi.stubGlobal('fetch', fetchSpy);
    await submitContactMessage({ name: 'Ada', email: 'ada@example.com', subject: 'Hi', message: 'Hello', turnstileToken: 'token' });
    expect(fetchSpy).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }));
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/api/contact.test.ts`

Expected: FAIL because the client currently uses `VITE_API_URL` when present.

- [ ] **Step 3: Implement the smallest client and build changes**

```json
{
  "scripts": {
    "build": "vite build && npm run build:worker",
    "build:worker": "esbuild worker/index.ts --bundle --format=esm --platform=browser --outfile=dist/_worker.js"
  }
}
```

Replace the API base declaration in `src/api/contact.ts` with:

```ts
const API_URL = '/api';
```

Keep the existing timeout, request body, and non-2xx error parsing unchanged.

- [ ] **Step 4: Verify unit and production build output**

Run: `npm test -- src/api/contact.test.ts && npm run build && test -f dist/_worker.js`

Expected: the client test passes, Vite and esbuild finish successfully, and `dist/_worker.js` exists.

- [ ] **Step 5: Commit the frontend proxy integration**

```bash
git add package.json src/api/contact.ts src/api/contact.test.ts
git commit -m "refactor(contact): use same-origin API" -m "Build the Pages Worker and remove the browser Vercel endpoint."
```

### Task 3: Configure deployment environments and document the new boundary

**Files:**
- Modify: `.github/workflows/deploy-frontend-cloudflare.yml`
- Modify: `.env.example`
- Modify: `DEPLOYMENT.md`

- [ ] **Step 1: Complete the missing-upstream test contract from Task 1**

Extend the Task 1 missing-upstream assertion so it verifies the exact public
response rather than only its HTTP status:

```ts
expect(await missing.json()).toEqual({
  error: 'API_UNAVAILABLE',
  message: 'The API service is temporarily unavailable.',
});
```

- [ ] **Step 2: Run the Worker test to verify the public error contract**

Run: `npm test -- worker/index.test.ts`

Expected: PASS after Task 1 implementation; the response is 502 and contains no
upstream hostname or caught exception text.

- [ ] **Step 3: Configure the Cloudflare runtime binding and update documentation**

Configure `API_BASE_URL` as a Cloudflare Pages **runtime environment variable**
in the Pages project settings; do not inject it as a Vite `VITE_*` build
variable and do not add it to the GitHub workflow build environment. Set:

```text
preview-cloudflare-pages API_BASE_URL=https://bayjf-dev.vercel.app
production-cloudflare-pages API_BASE_URL=https://bayjf.vercel.app
```

Remove `VITE_API_URL` from `.env.example`, the deployment workflow build env,
and `DEPLOYMENT.md`. Document `API_BASE_URL` as a Cloudflare Pages Worker
runtime binding and state that it is an upstream base URL without `/api`
appended.

- [ ] **Step 4: Verify configuration and full automated checks**

Run: `git diff --check && npm run lint && npm test && npm run build`

Expected: all commands exit 0 and the generated `dist/_worker.js` is present.

- [ ] **Step 5: Commit deployment configuration and documentation separately**

```bash
git add .github/workflows/deploy-frontend-cloudflare.yml .env.example
git commit -m "chore(deploy): configure Pages API upstream" -m "Provide the Worker proxy upstream per Cloudflare environment."
git add DEPLOYMENT.md
git commit -m "docs(deploy): document same-origin API proxy" -m "Describe the Pages Worker and Vercel API deployment boundary."
```

### Task 4: Validate the release path

**Files:**
- Modify: `e2e/bayjf.spec.ts`

- [ ] **Step 1: Add or update an end-to-end assertion that the contact route posts to `/api/contact`**

```ts
await page.route('**/api/contact', async (route) => {
  expect(route.request().url()).toContain('/api/contact');
  await route.fulfill({ status: 201, contentType: 'application/json', body: '{"ok":true}' });
});
```

- [ ] **Step 2: Run the new e2e assertion and verify it fails before the client change**

Run: `npm run test:e2e -- --grep "contact"`

Expected: it fails before Task 2 because the browser requests the configured cross-origin URL.

- [ ] **Step 3: Run end-to-end validation after the implementation**

Run: `npm run test:e2e -- --grep "contact"`

Expected: PASS. If the local Playwright environment cannot bind its preview server, record the exact environment error and do not claim it passed.

- [ ] **Step 4: Commit the e2e test change**

```bash
git add e2e/bayjf.spec.ts
git commit -m "test(contact): cover same-origin API route" -m "Verify the contact form posts through the Pages API proxy."
```

- [ ] **Step 5: Publish through the required PR gates after user authorization**

Run the repository workflow only after explicit user authorization: push `feature/20260719`, create and merge the real `feature/20260719 -> dev` PR after checks pass, verify Cloudflare Preview and Vercel Preview, then create and merge `dev -> main`, wait for both production deployments, and test `https://bayjf.pages.dev/api/health` plus a non-production contact submission.
