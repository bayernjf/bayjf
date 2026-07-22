import { afterEach, describe, expect, it, vi } from 'vitest';

describe('submitContactMessage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('posts contact messages to the same-origin API path', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    const fetchSpy = vi.fn(() => Promise.resolve(new Response(null, { status: 201 })));
    vi.stubGlobal('fetch', fetchSpy);
    const { submitContactMessage } = await import('./contact');

    await submitContactMessage({
      name: 'Ada',
      email: 'ada@example.com',
      subject: 'Hi',
      message: 'Hello',
      turnstileToken: 'token',
    });

    expect(fetchSpy).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }));
  });
});
