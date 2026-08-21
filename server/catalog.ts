import type { CatalogState, ProjectStatus } from '../src/data/projectCatalog';
import type { Env } from './types';

const SUPABASE_TIMEOUT_MS = 10_000;
const CATALOG_KEY = 'project_catalog';
const STATUSES: ReadonlySet<ProjectStatus> = new Set(['delist', 'soon', 'launch']);

export type CatalogValidationResult =
  | { success: true; data: CatalogState }
  | { success: false; message: string };

export function validateCatalogInput(value: unknown): CatalogValidationResult {
  if (!value || typeof value !== 'object') {
    return { success: false, message: 'Request body must be an object.' };
  }
  const body = value as { order?: unknown; status?: unknown };
  if (!Array.isArray(body.order) || !body.order.every((id) => typeof id === 'string')) {
    return { success: false, message: 'order must be an array of strings.' };
  }
  if (!body.status || typeof body.status !== 'object' || Array.isArray(body.status)) {
    return { success: false, message: 'status must be an object.' };
  }
  const order = body.order as string[];
  if (order.length === 0 || new Set(order).size !== order.length) {
    return { success: false, message: 'order must be non-empty and unique.' };
  }
  for (const [id, status] of Object.entries(body.status as Record<string, unknown>)) {
    if (typeof id !== 'string' || id.length > 64 || !STATUSES.has(status as ProjectStatus)) {
      return { success: false, message: `invalid status for project: ${id}` };
    }
  }
  return {
    success: true,
    data: { order, status: body.status as Record<string, ProjectStatus> },
  };
}

export interface CatalogRepository {
  get(): Promise<CatalogState | null>;
  put(catalog: CatalogState): Promise<void>;
}

export class SupabaseCatalogRepository implements CatalogRepository {
  constructor(private readonly env: Env) {}

  private headers(): Record<string, string> {
    return {
      apikey: this.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${this.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  async get(): Promise<CatalogState | null> {
    const baseUrl = this.env.SUPABASE_URL.replace(/\/$/, '');
    const response = await fetch(
      `${baseUrl}/rest/v1/app_settings?key=eq.${CATALOG_KEY}&select=value`,
      {
        method: 'GET',
        headers: this.headers(),
        signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS),
      },
    );
    if (!response.ok) {
      const detail = await response.text();
      console.error('Supabase catalog get failed', response.status, detail);
      throw new Error('CATALOG_LOOKUP_FAILED');
    }
    const rows = (await response.json()) as Array<{ value: CatalogState }>;
    return rows.length > 0 ? rows[0].value : null;
  }

  async put(catalog: CatalogState): Promise<void> {
    const baseUrl = this.env.SUPABASE_URL.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/rest/v1/app_settings`, {
      method: 'POST',
      headers: { ...this.headers(), Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ key: CATALOG_KEY, value: catalog, updated_at: new Date().toISOString() }),
      signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error('Supabase catalog put failed', response.status, detail);
      throw new Error('CATALOG_PERSISTENCE_FAILED');
    }
  }
}
