/**
 * Typed fetch wrapper.
 *
 * Why not call `fetch` from the hooks: every caller would have to remember to
 * check `res.ok`, because `fetch` only rejects on network failure — a 404
 * resolves happily and you end up rendering an error body as if it were a
 * listing. Centralising that check means React Query's `isError` actually
 * means what it says.
 */

export type ApiErrorCode =
  | 'not_found'
  | 'invalid_request'
  | 'dates_unavailable'
  | 'internal_error';

interface ApiErrorPayload {
  error?: { code?: string; message?: string; details?: unknown };
}

const CODES: readonly ApiErrorCode[] = [
  'not_found',
  'invalid_request',
  'dates_unavailable',
  'internal_error',
];

function asCode(value: string | undefined): ApiErrorCode {
  return CODES.find((code) => code === value) ?? 'internal_error';
}

/** Carries the server's `code` so callers can branch without parsing strings. */
export class ApiRequestError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }

  get isConflict(): boolean {
    return this.code === 'dates_unavailable';
  }
}

async function toError(response: Response): Promise<ApiRequestError> {
  let payload: ApiErrorPayload = {};
  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    // A proxy or a crash can return HTML; fall back to the status line.
  }
  return new ApiRequestError(
    asCode(payload.error?.code),
    response.status,
    payload.error?.message ?? `Request failed with ${response.status}`,
    payload.error?.details,
  );
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw await toError(response);
  return (await response.json()) as T;
}

export async function apiSend<T>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw await toError(response);
  return (await response.json()) as T;
}
