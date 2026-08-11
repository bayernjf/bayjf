import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createApp } from './app';
import {
  validateLikeInput,
  isToggleCoolingDown,
  markToggle,
  composeVisitorHash,
  SupabaseLikeRepository,
} from './likes';
import type { ContactRepository, Env, LikeRepository } from './types';

const env: Env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-key',
  ALLOWED_ORIGINS: 'https://bayjf.example.com',
  TURNSTILE_SECRET_KEY: 'test-secret',
};

const contactFactory = () => ({ create: vi.fn() }) as unknown as ContactRepository;

function visitorHeaders(lid: string) {
  return {
    Cookie: `bayjf_lid=${lid}`,
    'User-Agent': 'test-ua',
    'CF-Connecting-IP': '1.2.3.4',
  };
}

describe('validateLikeInput', () => {
  it('accepts a valid like payload', () => {
    const result = validateLikeInput({ projectId: 'soft-desk', source: 'grid', action: 'like' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ projectId: 'soft-desk', source: 'grid', action: 'like' });
    }
  });

  it('rejects an unknown source', () => {
    const result = validateLikeInput({ projectId: 'soft-desk', source: 'bogus', action: 'like' });
    expect(result.success).toBe(false);
    if (result.success === false) expect(result.errors.source).toBeDefined();
  });

  it('rejects an invalid action', () => {
    const result = validateLikeInput({ projectId: 'soft-desk', source: 'grid', action: 'maybe' });
    expect(result.success).toBe(false);
    if (result.success === false) expect(result.errors.action).toBeDefined();
  });

  it('rejects an empty projectId', () => {
    const result = validateLikeInput({ projectId: '', source: 'grid', action: 'like' });
    expect(result.success).toBe(false);
    if (result.success === false) expect(result.errors.projectId).toBeDefined();
  });
});

describe('toggle cooldown', () => {
  it('allows the first toggle then blocks rapid repeats for the same visitor', () => {
    const hash = 'viewer-a';
    expect(isToggleCoolingDown(hash)).toBe(false);
    markToggle(hash);
    expect(isToggleCoolingDown(hash)).toBe(true);
    expect(isToggleCoolingDown('different-visitor')).toBe(false);
  });
});

describe('composeVisitorHash', () => {
  it('returns a stable 64-char hex hash', async () => {
    const a = await composeVisitorHash('1.2.3.4', 'ua', 'lid');
    const b = await composeVisitorHash('1.2.3.4', 'ua', 'lid');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).toBe(b);
    const c = await composeVisitorHash('1.2.3.4', 'ua', 'other-lid');
    expect(c).not.toBe(a);
  });
});

describe('SupabaseLikeRepository', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('upsert targets the unique conflict and merges duplicates', async () => {
    await new SupabaseLikeRepository(env).upsert({
      project_id: 'soft-desk',
      visitor_hash: 'h',
      source: 'grid',
      is_active: true,
      ip_hash: 'i',
      user_agent: 'ua',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/rest/v1/project_likes?on_conflict=project_id,visitor_hash');
    expect((init.headers as Record<string, string>).Prefer).toBe('resolution=merge-duplicates');
    expect(init.body).toContain('"is_active":true');
  });

  it('listActiveByVisitor maps project_id rows', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([{ project_id: 'a' }, { project_id: 'b' }]), { status: 200 }),
    );
    const ids = await new SupabaseLikeRepository(env).listActiveByVisitor('h');
    expect(ids).toEqual(['a', 'b']);
  });
});

describe('like API routes', () => {
  beforeEach(() => {
    // Stub Turnstile verification (called only on `like`) to succeed.
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 })));
  });
  afterEach(() => vi.unstubAllGlobals());

  function makeRepo() {
    return {
      upsert: vi.fn<LikeRepository['upsert']>().mockResolvedValue(undefined),
      listActiveByVisitor: vi.fn<LikeRepository['listActiveByVisitor']>().mockResolvedValue([]),
      counts: vi.fn<LikeRepository['counts']>().mockResolvedValue({}),
    } as unknown as LikeRepository;
  }

  it('toggles like and persists is_active=true', async () => {
    const repo = makeRepo();
    const app = createApp(contactFactory, () => repo);
    const res = await app.request('/api/projects/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://bayjf.example.com', ...visitorHeaders('lid-like') },
      body: JSON.stringify({ projectId: 'soft-desk', source: 'grid', action: 'like', turnstileToken: 't' }),
    }, env);

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, liked: true, projectId: 'soft-desk' });
    expect(repo.upsert).toHaveBeenCalledWith(expect.objectContaining({
      project_id: 'soft-desk',
      is_active: true,
      visitor_hash: expect.any(String),
    }));
  });

  it('returns validation errors for bad input', async () => {
    const repo = makeRepo();
    const app = createApp(contactFactory, () => repo);
    const res = await app.request('/api/projects/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://bayjf.example.com', ...visitorHeaders('lid-valid') },
      body: JSON.stringify({ projectId: '', source: 'bogus', action: 'nope' }),
    }, env);

    expect(res.status).toBe(422);
    expect(repo.upsert).not.toHaveBeenCalled();
  });

  it('blocks rapid repeat toggles from the same visitor', async () => {
    const repo = makeRepo();
    const app = createApp(contactFactory, () => repo);
    const first = await app.request('/api/projects/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://bayjf.example.com', ...visitorHeaders('lid-repeat') },
      body: JSON.stringify({ projectId: 'soft-desk', source: 'grid', action: 'like', turnstileToken: 't' }),
    }, env);
    const second = await app.request('/api/projects/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://bayjf.example.com', ...visitorHeaders('lid-repeat') },
      body: JSON.stringify({ projectId: 'soft-desk', source: 'grid', action: 'unlike' }),
    }, env);

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
  });

  it('returns the visitor liked list from /mine', async () => {
    const repo = makeRepo();
    (repo.listActiveByVisitor as ReturnType<typeof vi.fn>).mockResolvedValue(['soft-desk', 'termana']);
    const app = createApp(contactFactory, () => repo);
    const res = await app.request('/api/projects/likes/mine', {
      method: 'GET',
      headers: { Origin: 'https://bayjf.example.com', ...visitorHeaders('lid-mine') },
    }, env);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ liked: ['soft-desk', 'termana'] });
  });
});
