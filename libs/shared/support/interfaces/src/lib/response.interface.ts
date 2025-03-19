export interface ApiResponse<D, M = string, Meta = unknown> {
  statusCode: number;
  message?: M;
  data: D;
  meta?: Meta;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  nextCursor?: string | null | undefined;
}

export type PaginatedApiResponse<D> = ApiResponse<PaginatedResponse<D>>;

export function apiResponse<D, M = string, Meta = unknown>(
  data: D,
  statusCode = 200,
  message?: M,
  meta?: Meta,
  error?: Record<string, unknown>
): ApiResponse<D, M, Meta> & { error?: Record<string, unknown> } {
  return {
    statusCode,
    message,
    data,
    meta,
    ...(error && { error }),
  };
}

export function paginatedApiResponse<T>(
  items: T[],
  total: number,
  nextCursor: string | null | undefined,
  limit: number,
  message = ''
): PaginatedApiResponse<T> {
  return apiResponse({ items, total, nextCursor, limit }, 200, message);
}
