export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken: string;
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

const API_URL = '/api';
const CONTACT_REQUEST_TIMEOUT_MS = 15_000;

export async function submitContactMessage(
  input: ContactMessageInput,
  signal?: AbortSignal,
): Promise<void> {
  const requestSignal = signal ?? AbortSignal.timeout(CONTACT_REQUEST_TIMEOUT_MS);
  const response = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: requestSignal,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiErrorBody;
    throw new Error(body.message || body.error || `Request failed with status ${response.status}`);
  }
}
