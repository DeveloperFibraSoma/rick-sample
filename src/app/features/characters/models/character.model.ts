import { ApiListResponse } from '../../../core/models/api-response.model';

export type CharacterStatus = 'alive' | 'dead' | 'unknown';
export type CharacterGender = 'female' | 'male' | 'genderless' | 'unknown';

export interface ApiReference {
  readonly name: string;
  readonly url: string;
}

export interface CharacterRecord {
  readonly id: number;
  readonly name: string;
  readonly status: CharacterStatus;
  readonly species: string;
  readonly type: string;
  readonly gender: CharacterGender;
  readonly origin: ApiReference;
  readonly location: ApiReference;
  readonly image: string;
  readonly episode: ReadonlyArray<string>;
  readonly url: string;
  readonly created: string;
  readonly favorite?: boolean;
}

export type CharacterListItem = Readonly<Pick<CharacterRecord, 'id' | 'name' | 'status' | 'species' | 'gender' | 'image' | 'origin' | 'location'>>;
export type CharacterDetail = Readonly<CharacterRecord>;
export type CharacterCreatePayload = Readonly<Partial<Omit<CharacterRecord, 'id' | 'episode' | 'url' | 'created'>>>;
export type CharacterUpdatePayload = Partial<CharacterCreatePayload>;

export interface CharacterQuery {
  readonly page?: number;
  readonly name?: string;
  readonly status?: CharacterStatus | 'all';
  readonly gender?: CharacterGender | 'all';
  readonly species?: string;
  readonly pageSize?: number;
}

export interface CharacterDashboardMetrics {
  readonly total: number;
  readonly alive: number;
  readonly dead: number;
  readonly unknown: number;
}

export type CharacterListResponse = ApiListResponse<CharacterListItem>;

export interface CharacterFormValue {
  readonly name: string;
  readonly status: CharacterStatus;
  readonly species: string;
  readonly type: string;
  readonly gender: CharacterGender;
  readonly originName: string;
  readonly locationName: string;
  readonly image: string;
}

export const CHARACTER_STATUS_LABELS: Readonly<Record<CharacterStatus, string>> = {
  alive: 'Vivo',
  dead: 'Muerto',
  unknown: 'Desconocido'
};

export const CHARACTER_STATUS_OPTIONS: ReadonlyArray<CharacterStatus | 'all'> = ['all', 'alive', 'dead', 'unknown'];
export const CHARACTER_GENDER_OPTIONS: ReadonlyArray<CharacterGender | 'all'> = ['all', 'female', 'male', 'genderless', 'unknown'];
