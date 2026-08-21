import { describe, expect, it } from 'vitest';
import { verifyPassword, createSessionCookie, verifySession, clearSessionCookie } from './admin';
import { validateCatalogInput } from './catalog';
import { mergeCatalog } from '../src/data/projectCatalog';
import type { Env } from './types';

const env: Env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-key',
  ADMIN_USERNAME: 'bayjf',
  ADMIN_PASSWORD_HASH: '',
  ADMIN_SESSION_SECRET: 'test-session-secret',
};

async function makeHash(password: string, iterations = 100000): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      key,
      256,
    ),
  );
  return `pbkdf2-sha256$${iterations}$${Buffer.from(salt).toString('base64')}$${Buffer.from(bits).toString('base64')}`;
}

describe('admin password', () => {
  it('accepts the correct password and rejects wrong ones', async () => {
    env.ADMIN_PASSWORD_HASH = await makeHash('correct horse battery staple');
    await expect(verifyPassword('correct horse battery staple', env.ADMIN_PASSWORD_HASH!)).resolves.toBe(true);
    await expect(verifyPassword('wrong', env.ADMIN_PASSWORD_HASH!)).resolves.toBe(false);
  });

  it('rejects malformed hashes without throwing', async () => {
    await expect(verifyPassword('x', 'not-a-hash')).resolves.toBe(false);
    await expect(verifyPassword('x', 'pbkdf2-sha256$10$short$short')).resolves.toBe(false);
  });
});

describe('admin session', () => {
  it('round-trips a signed cookie and rejects tampered tokens', async () => {
    const cookie = await createSessionCookie(env, 'bayjf');
    const match = cookie.match(/bayjf_admin=([^;]+)/);
    expect(match).not.toBeNull();

    const valid = await verifySession(env, `bayjf_admin=${match![1]}`);
    expect(valid?.username).toBe('bayjf');

    const tampered = `bayjf_admin=${match![1].slice(0, -2)}xx`;
    await expect(verifySession(env, tampered)).resolves.toBeNull();
    expect(clearSessionCookie()).toContain('Max-Age=0');
  });

  it('returns null for missing or wrong-secret cookies', async () => {
    await expect(verifySession(env, undefined)).resolves.toBeNull();
    const otherEnv = { ...env, ADMIN_SESSION_SECRET: 'different-secret' };
    const cookie = await createSessionCookie(env, 'bayjf');
    const token = cookie.match(/bayjf_admin=([^;]+)/)![1];
    await expect(verifySession(otherEnv, `bayjf_admin=${token}`)).resolves.toBeNull();
  });
});

describe('catalog validation', () => {
  it('accepts a valid order/status payload', () => {
    const result = validateCatalogInput({
      order: ['a', 'b'],
      status: { a: 'launch', b: 'soon' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects duplicate, empty, or bad-status payloads', () => {
    expect(validateCatalogInput({ order: ['a', 'a'], status: {} }).success).toBe(false);
    expect(validateCatalogInput({ order: [], status: {} }).success).toBe(false);
    expect(validateCatalogInput({ order: ['a'], status: { a: 'bogus' } }).success).toBe(false);
    expect(validateCatalogInput(null).success).toBe(false);
  });
});

describe('catalog merge', () => {
  it('lets an explicit launch status override a built-in soon default', () => {
    const catalog = mergeCatalog({ order: ['toclick'], status: { toclick: 'launch' } });
    expect(catalog.status.toclick).toBe('launch');
  });
});
