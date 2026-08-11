import type { Env } from './types';

const TURNSTILE_TIMEOUT_MS = 10_000;

export async function hashIp(ip: string | undefined): Promise<string | undefined> {
  if (!ip) return undefined;
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Visitor fingerprint hash: combines the edge IP, User-Agent and the long-lived
 * anonymous `bayjf_lid` cookie. Only the hash is persisted — no PII.
 */
export async function hashVisitor(ip: string | undefined, ua: string | undefined, lid: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip ?? ''}|${ua ?? ''}|${lid}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function verifyTurnstile(token: string, env: Env, remoteIp?: string): Promise<boolean> {
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
