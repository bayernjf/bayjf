import type { Env } from './types';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE_NAME = 'bayjf_admin';

export interface AdminSession {
  username: string;
  exp: number;
}

function b64urlEncode(input: ArrayBuffer | Uint8Array | string): string {
  const bytes = typeof input === 'string'
    ? new TextEncoder().encode(input)
    : input instanceof Uint8Array ? input : new Uint8Array(input);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2-sha256') return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 1000) return false;
  const salt = b64urlDecode(parts[2]);
  const expected = b64urlDecode(parts[3]);
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits'],
    );
    const bits = new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      key,
      256,
    ));
    if (bits.length !== expected.length) return false;
    let mismatch = 0;
    for (let i = 0; i < bits.length; i += 1) mismatch |= bits[i] ^ expected[i];
    return mismatch === 0;
  } catch {
    return false;
  }
}

export async function isAdminConfigured(env: Env): Promise<boolean> {
  return Boolean(env.ADMIN_USERNAME && env.ADMIN_PASSWORD_HASH && env.ADMIN_SESSION_SECRET);
}

export async function createSessionCookie(env: Env, username: string): Promise<string> {
  const session: AdminSession = { username, exp: Date.now() + SESSION_TTL_MS };
  const payload = b64urlEncode(JSON.stringify(session));
  const key = await hmacKey(env.ADMIN_SESSION_SECRET ?? '');
  const sig = b64urlEncode(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)),
  );
  const value = `${payload}.${sig}`;
  return `${COOKIE_NAME}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`;
}

export async function verifySession(env: Env, cookieHeader: string | undefined): Promise<AdminSession | null> {
  if (!env.ADMIN_SESSION_SECRET) return null;
  const raw = cookieHeader?.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!raw) return null;
  const token = raw.slice(COOKIE_NAME.length + 1);
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const key = await hmacKey(env.ADMIN_SESSION_SECRET);
    const valid = await crypto.subtle.verify('HMAC', key, b64urlDecode(sig), new TextEncoder().encode(payload));
    if (!valid) return null;
    const session = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))) as AdminSession;
    if (!session.username || typeof session.exp !== 'number' || session.exp < Date.now()) return null;
    if (env.ADMIN_USERNAME && !timingSafeEqual(session.username, env.ADMIN_USERNAME)) return null;
    return session;
  } catch {
    return null;
  }
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}
