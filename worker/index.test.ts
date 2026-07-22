import { describe, expect, it, vi } from 'vitest';
import { handleRequest } from './index';

const assets = { fetch: vi.fn(() => Promise.resolve(new Response('asset'))) };
const env = { ASSETS: assets, API_BASE_URL: 'https://api.example.com' };

describe('Pages API proxy', () => {
  it('delegates non-API requests to static assets', async () => {
    const response = await handleRequest(new Request('https://site.example/assets/app.js'), env);

    expect(await response.text()).toBe('asset');
    expect(assets.fetch).toHaveBeenCalledOnce();
  });

  it('forwards API requests to the configured upstream without infrastructure headers', async () => {
    const fetchSpy = vi.fn<(request: Request) => Promise<Response>>()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));
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
    expect(await missing.json()).toEqual({
      error: 'API_UNAVAILABLE',
      message: 'The API service is temporarily unavailable.',
    });
    expect(unreachable.status).toBe(502);
    expect(await unreachable.text()).not.toContain('internal upstream detail');
  });
});
