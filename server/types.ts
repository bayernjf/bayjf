export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ALLOWED_ORIGINS?: string;
  TURNSTILE_SECRET_KEY?: string;
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

export type LikeAction = 'like' | 'unlike';

export interface LikeInput {
  projectId: string;
  source: string;
  action: LikeAction;
}

export interface LikeRecord {
  project_id: string;
  visitor_hash: string;
  source: string;
  is_active: boolean;
  ip_hash?: string;
  user_agent?: string;
}

export interface LikeRepository {
  upsert(record: LikeRecord): Promise<void>;
  listActiveByVisitor(visitorHash: string): Promise<string[]>;
  counts(ids?: string[]): Promise<Record<string, number>>;
}
