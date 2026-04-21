import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { APP_CONFIG, DEFAULT_APP_CONFIG } from './core/config/app.tokens';
import { apiErrorInterceptor } from './core/http/api-error.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_CONFIG, useValue: DEFAULT_APP_CONFIG },
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([apiErrorInterceptor]))
  ]
};
