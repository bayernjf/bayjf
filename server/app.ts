import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { validateContactMessage } from './contact';
import { SupabaseContactRepository } from './supabase';
import type { ContactRepository, Env } from './types';

type Variables = { requestId: string };
type AppBindings = { Bindings: Env; Variables: Variables };
type RepositoryFactory = (env: Env) => ContactRepository;
const MAX_CONTACT_BODY_BYTES = 16 * 1024;
const TURNSTILE_TIMEOUT_MS = 10_000;
const CONTACT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const CONTACT_RATE_LIMIT_MAX = 5;
const contactAttempts = new Map<string, { count: number; resetAt: number }>();

function isContactRateLimited(ip: string | undefined): boolean {
  // Cloudflare supplies the IP in production. Skip anonymous local requests so
  // development and repository-level tests are not serialized behind one key.
  if (!ip) return false;
  const now = Date.now();
  const current = contactAttempts.get(ip);
  if (!current || current.resetAt <= now) {
    contactAttempts.set(ip, { count: 1, resetAt: now + CONTACT_RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > CONTACT_RATE_LIMIT_MAX;
}

function allowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function hashIp(ip: string | undefined): Promise<string | undefined> {
  if (!ip) return undefined;
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function verifyTurnstile(token: string, env: Env, remoteIp?: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY || !token) return false;
  try {
    const payload = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
    if (remoteIp) payload.set('remoteip', remoteIp);
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload,
      signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS),
    });
    if (!response.ok) return false;
    const result = await response.json() as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

export function createApp(
  repositoryFactory: RepositoryFactory = (env) => new SupabaseContactRepository(env),
) {
  const app = new Hono<AppBindings>();

  app.use('*', secureHeaders());
  app.use('*', async (c: Context<AppBindings>, next: () => Promise<void>) => {
    c.set('requestId', crypto.randomUUID());
    await next();
    c.header('X-Request-Id', c.get('requestId'));
  });
  app.use('/api/*', cors({
    origin: (origin, c) => allowedOrigins(c.env).includes(origin) ? origin : '',
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400,
  }));

  app.get('/api/health', (c: Context<AppBindings>) => c.json({ status: 'ok' }));

  app.post('/api/contact', async (c: Context<AppBindings>) => {
    const remoteIp = c.req.header('CF-Connecting-IP');
    if (isContactRateLimited(remoteIp)) {
      c.header('Retry-After', String(Math.ceil(CONTACT_RATE_LIMIT_WINDOW_MS / 1000)));
      return c.json({ error: 'RATE_LIMITED', message: 'Too many contact attempts. Try again later.' }, 429);
    }
    const contentLength = Number(c.req.header('Content-Length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_CONTACT_BODY_BYTES) {
      return c.json({ error: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' }, 413);
    }

    let body: unknown;
    try {
      const rawBody = await c.req.text();
      if (new TextEncoder().encode(rawBody).byteLength > MAX_CONTACT_BODY_BYTES) {
        return c.json({ error: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' }, 413);
      }
      body = JSON.parse(rawBody);
    } catch {
      return c.json({ error: 'INVALID_JSON', message: 'Request body must be valid JSON.' }, 400);
    }

    // Optional honeypot. Real users should leave this field empty.
    if (body && typeof body === 'object' && 'website' in body && body.website) {
      return c.json({ ok: true }, 201);
    }

    const result = validateContactMessage(body);
    if (result.success === false) {
      return c.json({ error: 'VALIDATION_ERROR', fields: result.errors }, 422);
    }

    const objectBody = body as Record<string, unknown>;
    const turnstileToken = typeof objectBody.turnstileToken === 'string'
      ? objectBody.turnstileToken
      : '';
    if (!await verifyTurnstile(turnstileToken, c.env, remoteIp)) {
      return c.json({ error: 'VERIFICATION_FAILED', message: 'Human verification failed.' }, 403);
    }

    try {
      await repositoryFactory(c.env).create({
        ...result.data,
        ip_hash: await hashIp(remoteIp),
        user_agent: c.req.header('User-Agent')?.slice(0, 500),
      });
      return c.json({ ok: true }, 201);
    } catch (error) {
      console.error('Contact submission failed', c.get('requestId'), error);
      return c.json({ error: 'INTERNAL_ERROR', message: 'Unable to send message right now.' }, 500);
    }
  });

  app.notFound((c: Context<AppBindings>) => c.json({ error: 'NOT_FOUND' }, 404));
  return app;
}

export const app = createApp();
