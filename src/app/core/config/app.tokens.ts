import { InjectionToken } from '@angular/core';

export interface AppConfig {
  readonly appName: string;
  readonly apiBaseUrl: string;
  readonly pageSize: number;
  readonly useRemoteApi: boolean;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export const DEFAULT_APP_CONFIG: AppConfig = {
  appName: 'RickMorty Explorer',
  apiBaseUrl: 'https://rickandmortyapi.com/api',
  pageSize: 8,
  useRemoteApi: true
};
