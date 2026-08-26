import { NextResponse } from 'next/server';

/**
 * One error shape for every endpoint.
 *
 * Why a discriminated payload instead of bare strings: the client needs to
 * branch on *what* went wrong (a date conflict re-renders the calendar, a
 * validation failure highlights a field, a 500 shows a toast). A stable
 * `code` makes that branch type-safe; `message` is only ever for humans.
 */
export type ApiErrorCode =
  | 'not_found'
  | 'invalid_request'
  | 'dates_unavailable'
  | 'internal_error';

export interface ApiErrorBody {
  readonly error: {
    readonly code: ApiErrorCode;
    readonly message: string;
    readonly details?: unknown;
  };
}

const STATUS: Record<ApiErrorCode, number> = {
  not_found: 404,
  invalid_request: 422,
  dates_unavailable: 409,
  internal_error: 500,
};

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get status(): number {
    return STATUS[this.code];
  }

  toResponse(): NextResponse<ApiErrorBody> {
    return NextResponse.json<ApiErrorBody>(
      { error: { code: this.code, message: this.message, details: this.details } },
      { status: this.status },
    );
  }
}

export const notFound = (message: string) => new ApiError('not_found', message);
export const invalidRequest = (message: string, details?: unknown) =>
  new ApiError('invalid_request', message, details);

/**
 * Wraps a handler so no route has to repeat try/catch.
 *
 * Unknown throws become a generic 500 and the real cause is logged rather
 * than serialised — leaking a SQL string or a file path to the client is how
 * schema details end up in a bug bounty report.
 */
export async function handle<T>(work: () => Promise<NextResponse<T>>) {
  try {
    return await work();
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse();
    console.error('[api] unhandled', error);
    return new ApiError('internal_error', 'Something went wrong').toResponse();
  }
}
