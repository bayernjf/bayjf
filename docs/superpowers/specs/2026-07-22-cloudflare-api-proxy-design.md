# BayJF Cloudflare API Proxy Design

## Goal

Route browser API traffic through the Cloudflare Pages origin so the BayJF site
uses same-origin `/api/*` requests, while Vercel continues to host the Hono API
and retains all private Supabase and Turnstile credentials.

## Current State

The frontend at `bayjf.pages.dev` embeds a Vercel API URL and posts contact
messages cross-origin. The browser therefore depends directly on the public
availability of the Vercel hostname and on CORS configuration.

## Target Architecture

```text
Browser
  -> Cloudflare Pages (`bayjf.pages.dev`)
       -> static assets for non-API requests
       -> `_worker.js` for `/api/*`
            -> Vercel Hono API
                 -> Turnstile verification
                 -> Supabase contact_messages
```

The browser only calls relative `/api/*` paths. The Worker reads the upstream
base URL from a non-public Cloudflare Pages environment variable named
`API_BASE_URL` and forwards the request to that upstream.

## Components

### Frontend API client

`src/api/contact.ts` will always construct the contact endpoint from `/api`.
It must not use `VITE_API_URL`, so no Vercel hostname is embedded in frontend
assets.

### Cloudflare Pages Worker

`public/_worker.js` will be copied into the built `dist` directory by Vite and
will be deployed as the Pages Worker.

- Requests outside `/api/*` use `env.ASSETS.fetch(request)`.
- API requests use `new URL(pathname + search, env.API_BASE_URL)` as the
  upstream target.
- The Worker preserves the HTTP method, body, and safe request headers.
- It removes `host` and Cloudflare infrastructure headers before forwarding.
- It returns a JSON `502` response with `API_UNAVAILABLE` when no upstream is
  configured or the upstream cannot be reached.
- It does not expose the upstream URL or caught exception text to browsers.

### Deployment configuration

Cloudflare Pages environments receive `API_BASE_URL` through the existing
frontend workflow:

- `preview-cloudflare-pages`: Vercel Preview API base URL.
- `production-cloudflare-pages`: Vercel Production API base URL.

`VITE_API_URL` is removed from the frontend build environment and deployment
documentation. Vercel continues to hold Supabase and Turnstile private values.

## Security and Failure Behavior

Same-origin browser requests no longer require CORS to function. The Vercel
API's existing origin allow-list remains configured as defence in depth.
The Worker forwards neither Cloudflare identity headers nor the request host.
It forwards API response status and safe headers, but strips response headers
that are unsafe or misleading through a proxy (`content-encoding`,
`set-cookie`, and credential CORS headers).

If the Worker cannot reach its upstream, the contact UI receives an explicit
service-unavailable response rather than a misleading instruction to start a
local API.

## Verification

Tests will cover static-asset delegation, successful API forwarding, a missing
`API_BASE_URL`, and an upstream network failure. The frontend API client test
will assert that it posts to `/api/contact`. Before release, the required
checks are type checking, unit tests, production build, and relevant Playwright
coverage. Deployment must follow the repository's feature -> dev -> main PR
workflow.
