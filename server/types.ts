export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ALLOWED_ORIGINS?: string;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactMessageRecord = ContactMessageInput & {
  ip_hash?: string;
  user_agent?: string;
};

export interface ContactRepository {
  create(message: ContactMessageRecord): Promise<void>;
}
