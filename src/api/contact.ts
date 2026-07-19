export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ApiErrorBody {
  error?: string;
}

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function submitContactMessage(
  input: ContactMessageInput,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiErrorBody;
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
}
