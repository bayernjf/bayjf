import type { ContactMessageRecord, ContactRepository, Env } from './types';

const SUPABASE_TIMEOUT_MS = 10_000;

export class SupabaseContactRepository implements ContactRepository {
  constructor(private readonly env: Env) {}

  async create(message: ContactMessageRecord): Promise<void> {
    const baseUrl = this.env.SUPABASE_URL.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/rest/v1/contact_messages`, {
      method: 'POST',
      headers: {
        apikey: this.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${this.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Supabase contact insert failed', response.status, detail);
      throw new Error('CONTACT_PERSISTENCE_FAILED');
    }
  }
}
