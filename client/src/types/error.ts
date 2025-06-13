export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface ApiErrorResponse {
  message: string;
  status: number;
  ok: boolean;
}
