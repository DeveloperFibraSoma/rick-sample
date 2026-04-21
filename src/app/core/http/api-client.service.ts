import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { APP_CONFIG } from '../config/app.tokens';
import { MockRickMortyServerService } from '../mock/mock-rick-morty-server.service';
import { QueryParams, toHttpParams } from './api-query';
import { ApiError, toApiError } from './api-error';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly mockServer = inject(MockRickMortyServerService);

  get<T>(path: string, params?: QueryParams): Observable<T> {
    if (!this.config.useRemoteApi) {
      return this.mockServer.request<T>('GET', path, undefined, { params });
    }

    return this.http.get<T>(this.buildUrl(path), { params: toHttpParams(params) }).pipe(
      catchError((error: unknown) =>
        this.mockServer.request<T>('GET', path, undefined, { params }).pipe(
          catchError(() => throwError(() => toApiError(error)))
        )
      )
    );
  }

  post<T>(path: string, body?: unknown, params?: QueryParams): Observable<T> {
    return this.mockServer.request<T>('POST', path, body, { params }).pipe(
      catchError((error: unknown) => throwError(() => toApiError(error)))
    );
  }

  put<T>(path: string, body?: unknown, params?: QueryParams): Observable<T> {
    return this.mockServer.request<T>('PUT', path, body, { params }).pipe(
      catchError((error: unknown) => throwError(() => toApiError(error)))
    );
  }

  patch<T>(path: string, body?: unknown, params?: QueryParams): Observable<T> {
    return this.mockServer.request<T>('PATCH', path, body, { params }).pipe(
      catchError((error: unknown) => throwError(() => toApiError(error)))
    );
  }

  delete<T>(path: string, params?: QueryParams): Observable<T> {
    return this.mockServer.request<T>('DELETE', path, undefined, { params }).pipe(
      catchError((error: unknown) => throwError(() => toApiError(error)))
    );
  }

  private buildUrl(path: string): string {
    const baseUrl = this.config.apiBaseUrl.replace(/\/+$/, '');
    const normalizedPath = path.replace(/^\/+/, '');
    return `${baseUrl}/${normalizedPath}`;
  }
}
