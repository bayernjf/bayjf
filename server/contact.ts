import type { ContactMessageInput } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  name: 100,
  email: 254,
  subject: 200,
  message: 5000,
} as const;

export type ContactValidationResult =
  | { success: true; data: ContactMessageInput }
  | { success: false; errors: Partial<Record<keyof ContactMessageInput, string>> };

export function validateContactMessage(value: unknown): ContactValidationResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { success: false, errors: { message: 'Request body must be an object.' } };
  }

  const body = value as Record<string, unknown>;
  const fields = ['name', 'email', 'subject', 'message'] as const;
  const data = {} as ContactMessageInput;
  const errors: Partial<Record<keyof ContactMessageInput, string>> = {};

  for (const field of fields) {
    const raw = body[field];
    if (typeof raw !== 'string' || !raw.trim()) {
      errors[field] = `${field} is required.`;
      continue;
    }

    const normalized = raw.trim();
    if (normalized.length > LIMITS[field]) {
      errors[field] = `${field} must be at most ${LIMITS[field]} characters.`;
      continue;
    }
    data[field] = normalized;
  }

  if (data.email && !EMAIL_PATTERN.test(data.email)) {
    errors.email = 'email must be a valid email address.';
  }

  return Object.keys(errors).length > 0
    ? { success: false, errors }
    : { success: true, data };
}
