import { apiResponse } from '@shared/support/interfaces';

export class DatabaseException extends Error {
  statusCode: number;
  context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.context = context;
  }

  getResponse() {
    return apiResponse(null, this.statusCode, this.message, undefined, false, {
      type: 'DatabaseError',
      detail: this.message,
      ...(this.context && { context: this.context }),
    });
  }
}
