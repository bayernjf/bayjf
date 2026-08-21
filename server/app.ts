import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { validateContactMessage } from './contact';
import { SupabaseContactRepository } from './supabase';
import { verifyTurnstile, hashIp } from './security';
import {
  SupabaseCatalogRepository,
  validateCatalogInput,
  type CatalogRepository,
} from './catalog';
import {
  verifyPassword,
  verifySession,
  createSessionCookie,
  clearSessionCookie,
  isAdminConfigured,
} from './admin';
import { DEFAULT_CATALOG, mergeCatalog } from '../src/data/projectCatalog';
import {
  SupabaseLikeRepository,
  validateLikeInput,
  isToggleCoolingDown,
  markToggle,
  composeVisitorHash,
} from './likes';
import type { ContactRepository, Env, LikeRepository } from './types';

type Variables = { requestId: string };
type AppBindings = { Bindings: Env; Variables: Variables };
type RepositoryFactory = (env: Env) => ContactRepository;
type LikesRepositoryFactory = (env: Env) => LikeRepository;
type CatalogRepositoryFactory = (env: Env) => CatalogRepository;
const MAX_CONTACT_BODY_BYTES = 16 * 1024;
const CONTACT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const CONTACT_RATE_LIMIT_MAX = 5;
const LID_COOKIE = 'bayjf_lid';
const LID_MAX_AGE = 365 * 24 * 60 * 60;
const MAX_CATALOG_BODY_BYTES = 64 * 1024;
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

function getCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

export function createApp(
  repositoryFactory: RepositoryFactory = (env) => new SupabaseContactRepository(env),
  likesRepositoryFactory: LikesRepositoryFactory = (env) => new SupabaseLikeRepository(env),
  catalogRepositoryFactory: CatalogRepositoryFactory = (env) => new SupabaseCatalogRepository(env),
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
    allowMethods: ['GET', 'POST', 'OPTIONS'],
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

  // ----- Project "like" toggle -----
  app.post('/api/projects/like', async (c: Context<AppBindings>) => {
    const remoteIp = c.req.header('CF-Connecting-IP');
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

    const result = validateLikeInput(body);
    if (result.success === false) {
      return c.json({ error: 'VALIDATION_ERROR', fields: result.errors }, 422);
    }

    const { projectId, source, action } = result.data;
    const lid = getCookie(c.req.header('Cookie'), LID_COOKIE);
    let newLid: string | undefined;
    const effectiveLid = lid ?? (newLid = crypto.randomUUID());
    const visitorHash = await composeVisitorHash(remoteIp, c.req.header('User-Agent'), effectiveLid);

    // Per-visitor cooldown: dampens rapid "like/unlike/like" toggling.
    if (isToggleCoolingDown(visitorHash)) {
      return c.json({ error: 'RATE_LIMITED', message: 'Slow down a moment before toggling again.' }, 429);
    }

    try {
      await likesRepositoryFactory(c.env).upsert({
        project_id: projectId,
        visitor_hash: visitorHash,
        source,
        is_active: action === 'like',
        ip_hash: await hashIp(remoteIp),
        user_agent: c.req.header('User-Agent')?.slice(0, 500),
      });
    } catch (error) {
      console.error('Like toggle failed', c.get('requestId'), error);
      return c.json({ error: 'INTERNAL_ERROR', message: 'Unable to update like right now.' }, 500);
    }

    markToggle(visitorHash);
    if (newLid) {
      c.header(
        'Set-Cookie',
        `${LID_COOKIE}=${newLid}; Path=/; Max-Age=${LID_MAX_AGE}; SameSite=Lax; HttpOnly`,
      );
    }
    return c.json({ ok: true, liked: action === 'like', projectId }, 200);
  });

  // ----- Current visitor's liked projects (initializes heart state) -----
  app.get('/api/projects/likes/mine', async (c: Context<AppBindings>) => {
    const remoteIp = c.req.header('CF-Connecting-IP');
    const lid = getCookie(c.req.header('Cookie'), LID_COOKIE);
    if (!lid) return c.json({ liked: [] }, 200);

    const visitorHash = await composeVisitorHash(remoteIp, c.req.header('User-Agent'), lid);
    try {
      const ids = await likesRepositoryFactory(c.env).listActiveByVisitor(visitorHash);
      return c.json({ liked: ids }, 200);
    } catch (error) {
      console.error('Like list failed', c.get('requestId'), error);
      return c.json({ error: 'INTERNAL_ERROR', message: 'Unable to load likes right now.' }, 500);
    }
  });

  // ----- Reserved per-project counts (not consumed by the frontend yet) -----
  app.get('/api/projects/likes/counts', async (c: Context<AppBindings>) => {
    const idsParam = c.req.query('ids');
    const ids = idsParam ? idsParam.split(',').map((id) => id.trim()).filter(Boolean) : undefined;
    try {
      const counts = await likesRepositoryFactory(c.env).counts(ids);
      return c.json({ counts }, 200);
    } catch (error) {
      console.error('Like counts failed', c.get('requestId'), error);
      return c.json({ error: 'INTERNAL_ERROR', message: 'Unable to load counts right now.' }, 500);
    }
  });

  // ----- Project catalog (order + status), admin-managed at /admin -----
  app.get('/api/catalog', async (c: Context<AppBindings>) => {
    try {
      const stored = await catalogRepositoryFactory(c.env).get();
      const catalog = stored ? mergeCatalog(stored) : DEFAULT_CATALOG;
      return c.json(
        { order: catalog.order, status: catalog.status },
        200,
        // No store: admin changes at /admin must take effect immediately for every visitor.
        { 'Cache-Control': 'no-store' },
      );
    } catch (error) {
      console.error('Catalog get failed', c.get('requestId'), error);
      return c.json(
        { order: DEFAULT_CATALOG.order, status: DEFAULT_CATALOG.status },
        200,
      );
    }
  });

  app.post('/api/admin/login', async (c: Context<AppBindings>) => {
    if (!await isAdminConfigured(c.env)) {
      return c.json({ error: 'NOT_CONFIGURED', message: 'Admin login is not configured.' }, 503);
    }
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'INVALID_JSON', message: 'Request body must be valid JSON.' }, 400);
    }
    const username = (body as Record<string, unknown>).username;
    const password = (body as Record<string, unknown>).password;
    if (typeof username !== 'string' || typeof password !== 'string') {
      return c.json({ error: 'INVALID_CREDENTIALS', message: 'Invalid username or password.' }, 401);
    }
    const usernameOk = username === c.env.ADMIN_USERNAME;
    const passwordOk = await verifyPassword(password, c.env.ADMIN_PASSWORD_HASH ?? '');
    if (!usernameOk || !passwordOk) {
      return c.json({ error: 'INVALID_CREDENTIALS', message: 'Invalid username or password.' }, 401);
    }
    c.header('Set-Cookie', await createSessionCookie(c.env, username));
    return c.json({ ok: true, username }, 200);
  });

  app.get('/api/admin/session', async (c: Context<AppBindings>) => {
    const session = await verifySession(c.env, c.req.header('Cookie'));
    return session ? c.json({ authenticated: true, username: session.username }, 200) : c.json({ authenticated: false }, 200);
  });

  app.post('/api/admin/logout', async (c: Context<AppBindings>) => {
    c.header('Set-Cookie', clearSessionCookie());
    return c.json({ ok: true }, 200);
  });

  app.post('/api/admin/catalog', async (c: Context<AppBindings>) => {
    const session = await verifySession(c.env, c.req.header('Cookie'));
    if (!session) {
      return c.json({ error: 'UNAUTHORIZED', message: 'Admin sign-in required.' }, 401);
    }
    const contentLength = Number(c.req.header('Content-Length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_CATALOG_BODY_BYTES) {
      return c.json({ error: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' }, 413);
    }
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'INVALID_JSON', message: 'Request body must be valid JSON.' }, 400);
    }
    const result = validateCatalogInput(body);
    if (result.success === false) {
      return c.json({ error: 'VALIDATION_ERROR', message: result.message }, 422);
    }
    try {
      const merged = mergeCatalog(result.data);
      await catalogRepositoryFactory(c.env).put(merged);
      return c.json({ order: merged.order, status: merged.status }, 200);
    } catch (error) {
      console.error('Catalog put failed', c.get('requestId'), error);
      return c.json({ error: 'INTERNAL_ERROR', message: 'Unable to save catalog right now.' }, 500);
    }
  });

  app.notFound((c: Context<AppBindings>) => c.json({ error: 'NOT_FOUND' }, 404));
  return app;
}

export const app = createApp();
