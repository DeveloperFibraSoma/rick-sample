export interface ApiError {
  readonly status: number;
  readonly code: string;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export function toApiError(error: unknown, fallbackMessage = 'Unexpected API error'): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return {
      status: 0,
      code: 'client_error',
      message: error.message || fallbackMessage
    };
  }

  return {
    status: 0,
    code: 'unknown_error',
    message: fallbackMessage
  };
}

function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'status' in value && 'code' in value && 'message' in value;
}
