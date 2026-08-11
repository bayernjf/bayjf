import type { Env, LikeInput, LikeRecord, LikeRepository } from './types';
import { hashVisitor } from './security';

const LIKE_COOLDOWN_MS = 1500;
const SUPABASE_TIMEOUT_MS = 10_000;

export const LIKE_SOURCES = [
  'grid',
  'timeline',
  'blind_box',
  'blind_box_open',
  'detail_modal',
  'search',
] as const;

export type LikeValidationResult =
  | { success: true; data: LikeInput }
  | { success: false; errors: Partial<Record<keyof LikeInput, string>> };

export function validateLikeInput(value: unknown): LikeValidationResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { success: false, errors: { projectId: 'Request body must be an object.' } };
  }

  const body = value as Record<string, unknown>;
  const errors: Partial<Record<keyof LikeInput, string>> = {};

  const projectId = typeof body.projectId === 'string' ? body.projectId.trim() : '';
  if (!projectId || projectId.length > 64) {
    errors.projectId = 'projectId is required and must be at most 64 characters.';
  }

  const source = typeof body.source === 'string' ? body.source.trim() : '';
  if (!source || !LIKE_SOURCES.includes(source as (typeof LIKE_SOURCES)[number])) {
    errors.source = `source must be one of: ${LIKE_SOURCES.join(', ')}.`;
  }

  const action = body.action;
  if (action !== 'like' && action !== 'unlike') {
    errors.action = "action must be 'like' or 'unlike'.";
  }

  return Object.keys(errors).length > 0
    ? { success: false, errors }
    : { success: true, data: { projectId, source, action: action as LikeInput['action'] } };
}

// In-memory per-visitor toggle cooldown. NOTE: on Vercel Edge this Map is
// per-instance / per-region and not shared across instances, so it only dampens
// rapid toggling from a single edge instance. Turnstile + the UNIQUE constraint
// are the cross-instance backstops (see docs/LIKES_FEATURE_DESIGN.md).
const lastToggleAt = new Map<string, number>();

export function isToggleCoolingDown(visitorHash: string): boolean {
  const last = lastToggleAt.get(visitorHash);
  if (!last) return false;
  return Date.now() - last < LIKE_COOLDOWN_MS;
}

export function markToggle(visitorHash: string): void {
  lastToggleAt.set(visitorHash, Date.now());
}

export async function composeVisitorHash(
  ip: string | undefined,
  ua: string | undefined,
  lid: string,
): Promise<string> {
  return hashVisitor(ip, ua, lid);
}

export class SupabaseLikeRepository implements LikeRepository {
  constructor(private readonly env: Env) {}

  async upsert(record: LikeRecord): Promise<void> {
    const baseUrl = this.env.SUPABASE_URL.replace(/\/$/, '');
    const response = await fetch(
      `${baseUrl}/rest/v1/project_likes?on_conflict=project_id,visitor_hash`,
      {
        method: 'POST',
        headers: {
          apikey: this.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${this.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error('Supabase like upsert failed', response.status, detail);
      throw new Error('LIKE_PERSISTENCE_FAILED');
    }
  }

  async listActiveByVisitor(visitorHash: string): Promise<string[]> {
    const baseUrl = this.env.SUPABASE_URL.replace(/\/$/, '');
    const response = await fetch(
      `${baseUrl}/rest/v1/project_likes?visitor_hash=eq.${encodeURIComponent(visitorHash)}&is_active=eq.true&select=project_id`,
      {
        method: 'GET',
        headers: {
          apikey: this.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${this.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error('Supabase like list failed', response.status, detail);
      throw new Error('LIKE_LOOKUP_FAILED');
    }

    const rows = (await response.json()) as Array<{ project_id: string }>;
    return rows.map((row) => row.project_id);
  }

  async counts(ids?: string[]): Promise<Record<string, number>> {
    const baseUrl = this.env.SUPABASE_URL.replace(/\/$/, '');
    const filter = ids && ids.length > 0
      ? `?project_id=in.(${ids.map(encodeURIComponent).join(',')})`
      : '';
    const response = await fetch(
      `${baseUrl}/rest/v1/project_like_counts${filter}`,
      {
        method: 'GET',
        headers: {
          apikey: this.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${this.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error('Supabase like counts failed', response.status, detail);
      throw new Error('LIKE_COUNTS_FAILED');
    }

    const rows = (await response.json()) as Array<{ project_id: string; count: number }>;
    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.project_id] = row.count;
      return acc;
    }, {});
  }
}
