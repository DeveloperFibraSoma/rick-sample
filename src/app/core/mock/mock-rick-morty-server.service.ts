import { Injectable, signal } from '@angular/core';
import { defer, map, Observable, of, switchMap } from 'rxjs';
import { ApiError } from '../http/api-error';
import { ApiListResponse, ApiPaginationInfo } from '../models/api-response.model';
import {
  CharacterCreatePayload,
  CharacterDetail,
  CharacterGender,
  CharacterListItem,
  CharacterQuery,
  CharacterRecord,
  CharacterStatus,
  CharacterUpdatePayload
} from '../../features/characters/models/character.model';

interface RequestOptions {
  readonly params?: CharacterQuery & Readonly<Record<string, unknown>>;
}

@Injectable({ providedIn: 'root' })
export class MockRickMortyServerService {
  private readonly characters = signal<ReadonlyArray<CharacterRecord>>(seedCharacters);
  private readonly latencyMs = 180;

  request<T>(method: string, path: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return defer(() =>
      of(null).pipe(
        switchMap(() => this.handle<T>(method, path, body, options)),
        map((value) => value)
      )
    );
  }

  private handle<T>(method: string, path: string, body?: unknown, options?: RequestOptions): Observable<T> {
    const normalizedPath = path.replace(/^\/+|\/+$/g, '');

    return new Observable<T>((subscriber) => {
      const timer = setTimeout(() => {
        try {
          const result = this.resolve<T>(method.toUpperCase(), normalizedPath, body, options);
          subscriber.next(result);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      }, this.latencyMs);

      return () => clearTimeout(timer);
    });
  }

  private resolve<T>(method: string, path: string, body?: unknown, options?: RequestOptions): T {
    const segments = path.split('/').filter(Boolean);

    if (segments[0] === 'dashboard' && segments[1] === 'metrics' && method === 'GET') {
      return this.metrics() as T;
    }

    if (segments[0] !== 'character') {
      throw this.notFound(path);
    }

    if (method === 'GET' && segments.length === 1) {
      return this.list(options?.params) as T;
    }

    if (method === 'GET' && segments.length === 2) {
      return this.detail(Number(segments[1])) as T;
    }

    if (method === 'POST' && segments.length === 1) {
      return this.create(body as CharacterCreatePayload) as T;
    }

    if (segments.length === 2 && (method === 'PUT' || method === 'PATCH')) {
      return this.update(Number(segments[1]), body as CharacterUpdatePayload, method === 'PATCH') as T;
    }

    if (method === 'DELETE' && segments.length === 2) {
      this.delete(Number(segments[1]));
      return undefined as T;
    }

    throw this.notFound(path);
  }

  private list(params?: CharacterQuery & Readonly<Record<string, unknown>>): ApiListResponse<CharacterListItem> {
    const pageSize = this.pageSizeFrom(params);
    const filtered = this.filterCharacters(params);
    const count = filtered.length;
    const pages = Math.max(1, Math.ceil(count / pageSize));
    const page = this.normalizePage(params?.page, pages);
    const start = (page - 1) * pageSize;
    const results = filtered.slice(start, start + pageSize).map((character) => this.toListItem(character));

    return {
      info: {
        count,
        pages,
        next: page < pages ? `/character?page=${page + 1}` : null,
        prev: page > 1 ? `/character?page=${page - 1}` : null
      },
      results
    };
  }

  private detail(id: number): CharacterDetail {
    const character = this.characters().find((item) => item.id === id);

    if (!character) {
      throw this.notFound(`/character/${id}`);
    }

    return character;
  }

  private create(payload: CharacterCreatePayload): CharacterDetail {
    const nextId = Math.max(...this.characters().map((item) => item.id), 0) + 1;
    const created: CharacterRecord = {
      id: nextId,
      name: payload.name?.trim() || `Character ${nextId}`,
      status: payload.status ?? 'unknown',
      species: payload.species?.trim() || 'Unknown',
      type: payload.type?.trim() || '',
      gender: payload.gender ?? 'unknown',
      origin: payload.origin ?? { name: 'Unknown', url: '' },
      location: payload.location ?? { name: 'Unknown', url: '' },
      image: payload.image?.trim() || placeholderImage(nextId),
      episode: [],
      url: `https://rickandmortyapi.com/api/character/${nextId}`,
      created: new Date().toISOString(),
      favorite: false
    };

    this.characters.update((items) => [created, ...items]);
    return created;
  }

  private update(id: number, payload: CharacterUpdatePayload, partial: boolean): CharacterDetail {
    let result: CharacterRecord | null = null;

    this.characters.update((items) =>
      items.map((item) => {
        if (item.id !== id) {
          return item;
        }

        result = {
          ...item,
          ...(partial ? payload : this.completeUpdatePayload(item, payload)),
          origin: payload.origin ?? item.origin,
          location: payload.location ?? item.location,
          image: payload.image ?? item.image
        };

        return result;
      })
    );

    if (!result) {
      throw this.notFound(`/character/${id}`);
    }

    return result;
  }

  private delete(id: number): void {
    const before = this.characters().length;
    this.characters.update((items) => items.filter((item) => item.id !== id));

    if (this.characters().length === before) {
      throw this.notFound(`/character/${id}`);
    }
  }

  private metrics(): CharacterMetrics {
    const items = this.characters();
    return {
      total: items.length,
      alive: items.filter((item) => item.status === 'alive').length,
      dead: items.filter((item) => item.status === 'dead').length,
      unknown: items.filter((item) => item.status === 'unknown').length
    };
  }

  private filterCharacters(params?: CharacterQuery & Readonly<Record<string, unknown>>): ReadonlyArray<CharacterRecord> {
    const query = (params?.name ?? '').toString().trim().toLowerCase();
    const status = params?.status?.toString().toLowerCase();
    const gender = params?.gender?.toString().toLowerCase();
    const species = (params?.species ?? '').toString().trim().toLowerCase();

    return this.characters().filter((item) => {
      const matchesName = !query || item.name.toLowerCase().includes(query);
      const matchesStatus = !status || status === 'all' || item.status === status;
      const matchesGender = !gender || gender === 'all' || item.gender === gender;
      const matchesSpecies = !species || item.species.toLowerCase().includes(species);

      return matchesName && matchesStatus && matchesGender && matchesSpecies;
    });
  }

  private completeUpdatePayload(item: CharacterRecord, payload: CharacterUpdatePayload): CharacterUpdatePayload {
    return {
      name: payload.name ?? item.name,
      status: payload.status ?? item.status,
      species: payload.species ?? item.species,
      type: payload.type ?? item.type,
      gender: payload.gender ?? item.gender,
      origin: payload.origin ?? item.origin,
      location: payload.location ?? item.location,
      image: payload.image ?? item.image
    };
  }

  private toListItem(character: CharacterRecord): CharacterListItem {
    return {
      id: character.id,
      name: character.name,
      status: character.status,
      species: character.species,
      gender: character.gender,
      image: character.image,
      origin: character.origin,
      location: character.location
    };
  }

  private pageSizeFrom(params?: CharacterQuery & Readonly<Record<string, unknown>>): number {
    const size = Number(params?.['pageSize'] ?? 8);
    return Number.isFinite(size) && size > 0 ? size : 8;
  }

  private normalizePage(value: unknown, pages: number): number {
    const page = Number(value ?? 1);
    if (!Number.isFinite(page) || page < 1) {
      return 1;
    }
    return Math.min(Math.floor(page), pages);
  }

  private notFound(path: string): ApiError {
    return {
      status: 404,
      code: 'not_found',
      message: `Resource not found: ${path}`
    };
  }
}

interface CharacterMetrics {
  readonly total: number;
  readonly alive: number;
  readonly dead: number;
  readonly unknown: number;
}

function placeholderImage(id: number): string {
  return `https://rickandmortyapi.com/api/character/avatar/${(id % 20) + 1}.jpeg`;
}

const seedCharacters: ReadonlyArray<CharacterRecord> = [
  {
    id: 1,
    name: 'Rick Sanchez',
    status: 'alive',
    species: 'Human',
    type: 'Scientist',
    gender: 'male',
    origin: { name: 'Earth (C-137)', url: '' },
    location: { name: 'Citadel of Ricks', url: '' },
    image: placeholderImage(1),
    episode: ['S01E01', 'S01E02'],
    url: 'https://rickandmortyapi.com/api/character/1',
    created: '2017-11-04T18:48:46.250Z'
  },
  {
    id: 2,
    name: 'Morty Smith',
    status: 'alive',
    species: 'Human',
    type: 'Student',
    gender: 'male',
    origin: { name: 'Earth (C-137)', url: '' },
    location: { name: 'Earth (Replacement Dimension)', url: '' },
    image: placeholderImage(2),
    episode: ['S01E01', 'S01E02'],
    url: 'https://rickandmortyapi.com/api/character/2',
    created: '2017-11-04T18:50:21.651Z'
  },
  {
    id: 3,
    name: 'Summer Smith',
    status: 'alive',
    species: 'Human',
    type: 'Teenager',
    gender: 'female',
    origin: { name: 'Earth (Replacement Dimension)', url: '' },
    location: { name: 'Earth (Replacement Dimension)', url: '' },
    image: placeholderImage(3),
    episode: ['S01E01', 'S01E02'],
    url: 'https://rickandmortyapi.com/api/character/3',
    created: '2017-11-04T19:09:56.428Z'
  },
  {
    id: 4,
    name: 'Beth Smith',
    status: 'alive',
    species: 'Human',
    type: 'Veterinarian',
    gender: 'female',
    origin: { name: 'Earth (Replacement Dimension)', url: '' },
    location: { name: 'Earth (Replacement Dimension)', url: '' },
    image: placeholderImage(4),
    episode: ['S01E01'],
    url: 'https://rickandmortyapi.com/api/character/4',
    created: '2017-11-04T19:22:43.665Z'
  },
  {
    id: 5,
    name: 'Jerry Smith',
    status: 'alive',
    species: 'Human',
    type: 'Unemployed',
    gender: 'male',
    origin: { name: 'Earth (Replacement Dimension)', url: '' },
    location: { name: 'Earth (Replacement Dimension)', url: '' },
    image: placeholderImage(5),
    episode: ['S01E01'],
    url: 'https://rickandmortyapi.com/api/character/5',
    created: '2017-11-04T19:26:56.301Z'
  },
  {
    id: 6,
    name: 'Abadango Cluster Princess',
    status: 'alive',
    species: 'Alien',
    type: 'Royalty',
    gender: 'female',
    origin: { name: 'Abadango', url: '' },
    location: { name: 'Abadango', url: '' },
    image: placeholderImage(6),
    episode: ['S01E06'],
    url: 'https://rickandmortyapi.com/api/character/6',
    created: '2017-11-04T19:50:28.250Z'
  },
  {
    id: 7,
    name: 'Abradolf Lincler',
    status: 'unknown',
    species: 'Human/Alien',
    type: 'Genetically engineered',
    gender: 'male',
    origin: { name: 'Earth (Replacement Dimension)', url: '' },
    location: { name: 'Testicle Monster Dimension', url: '' },
    image: placeholderImage(7),
    episode: ['S01E06'],
    url: 'https://rickandmortyapi.com/api/character/7',
    created: '2017-11-04T19:59:20.523Z'
  },
  {
    id: 8,
    name: 'Adjudicator Rick',
    status: 'dead',
    species: 'Human',
    type: 'Council member',
    gender: 'male',
    origin: { name: 'Unknown', url: '' },
    location: { name: 'Citadel of Ricks', url: '' },
    image: placeholderImage(8),
    episode: ['S01E10'],
    url: 'https://rickandmortyapi.com/api/character/8',
    created: '2017-11-04T20:03:34.737Z'
  },
  {
    id: 9,
    name: 'Agency Director',
    status: 'dead',
    species: 'Human',
    type: 'Director',
    gender: 'male',
    origin: { name: 'Earth', url: '' },
    location: { name: 'Earth', url: '' },
    image: placeholderImage(9),
    episode: ['S01E10'],
    url: 'https://rickandmortyapi.com/api/character/9',
    created: '2017-11-04T20:06:54.976Z'
  },
  {
    id: 10,
    name: 'Alan Rails',
    status: 'dead',
    species: 'Human',
    type: 'Superhero',
    gender: 'male',
    origin: { name: 'Earth (Unknown Dimension)', url: '' },
    location: { name: 'Earth (Unknown Dimension)', url: '' },
    image: placeholderImage(10),
    episode: ['S02E02'],
    url: 'https://rickandmortyapi.com/api/character/10',
    created: '2017-11-04T20:19:09.017Z'
  },
  {
    id: 11,
    name: 'Albert Einstein',
    status: 'dead',
    species: 'Human',
    type: 'Scientist',
    gender: 'male',
    origin: { name: 'Earth', url: '' },
    location: { name: 'Earth', url: '' },
    image: placeholderImage(11),
    episode: ['S01E01'],
    url: 'https://rickandmortyapi.com/api/character/11',
    created: '2017-11-04T20:20:20.171Z'
  },
  {
    id: 12,
    name: 'Alien Googah',
    status: 'unknown',
    species: 'Alien',
    type: '',
    gender: 'unknown',
    origin: { name: 'Alien Planet', url: '' },
    location: { name: 'Alien Planet', url: '' },
    image: placeholderImage(12),
    episode: ['S01E05'],
    url: 'https://rickandmortyapi.com/api/character/12',
    created: '2017-11-04T20:20:20.172Z'
  },
  {
    id: 13,
    name: 'Antenna Morty',
    status: 'alive',
    species: 'Human',
    type: 'Mutated',
    gender: 'male',
    origin: { name: 'Earth', url: '' },
    location: { name: 'Citadel of Ricks', url: '' },
    image: placeholderImage(13),
    episode: ['S01E10'],
    url: 'https://rickandmortyapi.com/api/character/13',
    created: '2017-11-04T20:24:24.666Z'
  },
  {
    id: 14,
    name: 'Arcade Alien',
    status: 'unknown',
    species: 'Alien',
    type: 'Player',
    gender: 'male',
    origin: { name: 'Arcade Dimension', url: '' },
    location: { name: 'Arcade Dimension', url: '' },
    image: placeholderImage(14),
    episode: ['S02E03'],
    url: 'https://rickandmortyapi.com/api/character/14',
    created: '2017-11-04T20:27:04.085Z'
  },
  {
    id: 15,
    name: 'Armothy',
    status: 'dead',
    species: 'Human',
    type: 'Arm',
    gender: 'male',
    origin: { name: 'Earth', url: '' },
    location: { name: 'Earth', url: '' },
    image: placeholderImage(15),
    episode: ['S02E04'],
    url: 'https://rickandmortyapi.com/api/character/15',
    created: '2017-11-04T20:29:45.000Z'
  },
  {
    id: 16,
    name: 'Baby Legs',
    status: 'alive',
    species: 'Human',
    type: 'Crime boss',
    gender: 'male',
    origin: { name: 'Earth', url: '' },
    location: { name: 'Earth', url: '' },
    image: placeholderImage(16),
    episode: ['S02E06'],
    url: 'https://rickandmortyapi.com/api/character/16',
    created: '2017-11-04T20:33:10.112Z'
  },
  {
    id: 17,
    name: 'Bearded Lady',
    status: 'alive',
    species: 'Human',
    type: 'Carnival performer',
    gender: 'female',
    origin: { name: 'Earth', url: '' },
    location: { name: 'Earth', url: '' },
    image: placeholderImage(17),
    episode: ['S02E06'],
    url: 'https://rickandmortyapi.com/api/character/17',
    created: '2017-11-04T20:35:06.777Z'
  },
  {
    id: 18,
    name: 'Blim Blam',
    status: 'dead',
    species: 'Alien',
    type: 'Security',
    gender: 'male',
    origin: { name: 'Blim Planet', url: '' },
    location: { name: 'Blim Planet', url: '' },
    image: placeholderImage(18),
    episode: ['S02E08'],
    url: 'https://rickandmortyapi.com/api/character/18',
    created: '2017-11-04T20:38:22.230Z'
  },
  {
    id: 19,
    name: 'Blue Shirt Rick',
    status: 'alive',
    species: 'Human',
    type: 'Alt Rick',
    gender: 'male',
    origin: { name: 'Earth (C-137)', url: '' },
    location: { name: 'Citadel of Ricks', url: '' },
    image: placeholderImage(19),
    episode: ['S01E10'],
    url: 'https://rickandmortyapi.com/api/character/19',
    created: '2017-11-04T20:41:08.251Z'
  },
  {
    id: 20,
    name: 'Bootleg Rick',
    status: 'unknown',
    species: 'Human',
    type: 'Con artist',
    gender: 'male',
    origin: { name: 'Earth', url: '' },
    location: { name: 'Earth', url: '' },
    image: placeholderImage(20),
    episode: ['S02E02'],
    url: 'https://rickandmortyapi.com/api/character/20',
    created: '2017-11-04T20:45:00.000Z'
  }
];
