export interface ApiResponse<D, M = string, Meta = unknown> {
  statusCode: number;
  message?: M;
  data: D;
  meta?: Meta;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
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

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return { items, total, page, limit };
}

export function paginatedApiResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success'
): PaginatedApiResponse<T> {
  return apiResponse(
    paginatedResponse(items, total, page, limit),
    200,
    message
  );
}
