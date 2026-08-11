export type LikeAction = 'like' | 'unlike';

export interface ToggleLikeInput {
  projectId: string;
  source: string;
  action: LikeAction;
  turnstileToken?: string;
}

export interface ToggleLikeResult {
  ok: boolean;
  liked: boolean;
  projectId: string;
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

const API_URL = '/api';
const LIKE_REQUEST_TIMEOUT_MS = 15_000;

export async function toggleLike(
  input: ToggleLikeInput,
  signal?: AbortSignal,
): Promise<ToggleLikeResult> {
  const requestSignal = signal ?? AbortSignal.timeout(LIKE_REQUEST_TIMEOUT_MS);
  const response = await fetch(`${API_URL}/projects/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: requestSignal,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiErrorBody;
    throw new Error(body.message || body.error || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as ToggleLikeResult;
}

export async function fetchMyLikes(signal?: AbortSignal): Promise<string[]> {
  const requestSignal = signal ?? AbortSignal.timeout(LIKE_REQUEST_TIMEOUT_MS);
  const response = await fetch(`${API_URL}/projects/likes/mine`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal: requestSignal,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiErrorBody;
    throw new Error(body.message || body.error || `Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { liked: string[] };
  return data.liked ?? [];
}
