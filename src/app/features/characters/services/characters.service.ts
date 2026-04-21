import { Injectable, inject } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client.service';
import {
  CharacterCreatePayload,
  CharacterDashboardMetrics,
  CharacterDetail,
  CharacterListItem,
  CharacterListResponse,
  CharacterQuery,
  CharacterUpdatePayload
} from '../models/character.model';
import { QueryParams } from '../../../core/http/api-query';

@Injectable({ providedIn: 'root' })
export class CharactersService {
  private readonly api = inject(ApiClient);

  list(query: CharacterQuery = {}): Observable<CharacterListResponse> {
    return this.api.get<CharacterListResponse>('character', normalizeListQuery(query));
  }

  detail(id: number): Observable<CharacterDetail> {
    return this.api.get<CharacterDetail>(`character/${id}`);
  }

  search(term: string): Observable<ReadonlyArray<CharacterListItem>> {
    const query = term.trim();
    if (!query) {
      return of([]);
    }

    return this.api
      .get<CharacterListResponse>('character', { name: query, page: 1, pageSize: 5 })
      .pipe(map((response) => response.results));
  }

  metrics(): Observable<CharacterDashboardMetrics> {
    return this.api.get<CharacterDashboardMetrics>('dashboard/metrics');
  }

  create(payload: CharacterCreatePayload): Observable<CharacterDetail> {
    return this.api.post<CharacterDetail>('character', payload);
  }

  update(id: number, payload: CharacterUpdatePayload): Observable<CharacterDetail> {
    return this.api.put<CharacterDetail>(`character/${id}`, payload);
  }

  patch(id: number, payload: CharacterUpdatePayload): Observable<CharacterDetail> {
    return this.api.patch<CharacterDetail>(`character/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`character/${id}`);
  }
}

function normalizeListQuery(query: CharacterQuery): QueryParams {
  return {
    ...query,
    status: query.status === 'all' ? undefined : query.status,
    gender: query.gender === 'all' ? undefined : query.gender
  };
}
