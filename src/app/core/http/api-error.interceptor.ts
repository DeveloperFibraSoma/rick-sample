import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError, toApiError } from './api-error';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      const httpError = error as HttpErrorResponse;
      const normalized: ApiError =
        error instanceof HttpErrorResponse
          ? {
              status: httpError.status,
              code: 'http_error',
              message: httpError.error?.message ?? httpError.message ?? 'HTTP request failed',
              details: typeof httpError.error === 'object' ? httpError.error : undefined
            }
          : toApiError(error);

      return throwError(() => normalized);
    })
  );
