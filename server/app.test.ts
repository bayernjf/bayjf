import { describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import type { ContactRepository, Env } from './types';

const env: Env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-key',
  ALLOWED_ORIGINS: 'https://bayjf.example.com',
};

describe('contact API', () => {
  it('persists a valid submission', async () => {
    const create = vi.fn<ContactRepository['create']>().mockResolvedValue(undefined);
    const app = createApp(() => ({ create }));
    const response = await app.request('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://bayjf.example.com' },
      body: JSON.stringify({
        name: 'Ada', email: 'ada@example.com', subject: 'Hello', message: 'A new project',
      }),
    }, env);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ email: 'ada@example.com' }));
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://bayjf.example.com');
  });

  it('returns field errors for invalid submissions', async () => {
    const create = vi.fn<ContactRepository['create']>();
    const app = createApp(() => ({ create }));
    const response = await app.request('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
    }, env);

    expect(response.status).toBe(422);
    expect(create).not.toHaveBeenCalled();
  });

  it('does not leak persistence errors', async () => {
    const app = createApp(() => ({ create: vi.fn().mockRejectedValue(new Error('database detail')) }));
    const response = await app.request('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ada', email: 'ada@example.com', subject: 'Hi', message: 'Hello' }),
    }, env);
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('database detail');
  });
});
