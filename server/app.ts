import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { validateContactMessage } from './contact';
import { SupabaseContactRepository } from './supabase';
import type { ContactRepository, Env } from './types';

type Variables = { requestId: string };
type AppBindings = { Bindings: Env; Variables: Variables };
type RepositoryFactory = (env: Env) => ContactRepository;

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

export function createApp(
  repositoryFactory: RepositoryFactory = (env) => new SupabaseContactRepository(env),
) {
  const app = new Hono<AppBindings>();

  app.use('*', secureHeaders());
  app.use('*', async (c, next) => {
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

  app.get('/api/health', (c) => c.json({ status: 'ok' }));

  app.post('/api/contact', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
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

    try {
      await repositoryFactory(c.env).create({
        ...result.data,
        ip_hash: await hashIp(c.req.header('CF-Connecting-IP')),
        user_agent: c.req.header('User-Agent')?.slice(0, 500),
      });
      return c.json({ ok: true }, 201);
    } catch (error) {
      console.error('Contact submission failed', c.get('requestId'), error);
      return c.json({ error: 'INTERNAL_ERROR', message: 'Unable to send message right now.' }, 500);
    }
  });

  app.notFound((c) => c.json({ error: 'NOT_FOUND' }, 404));
  return app;
}

export const app = createApp();
