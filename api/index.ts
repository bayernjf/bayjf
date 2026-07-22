import { app } from '../server/app';
import type { Env } from '../server/types';

export const config = { runtime: 'edge' };

export default function handler(request: Request) {
  const env: Env = {
    SUPABASE_URL: process.env.SUPABASE_URL ?? '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  };

  return app.fetch(request, env);
}
