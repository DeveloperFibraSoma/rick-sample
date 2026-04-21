import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
      },
      {
        path: 'characters',
        loadChildren: () => import('./features/characters/characters.routes').then((m) => m.CHARACTERS_ROUTES)
      },
      {
        path: 'search',
        loadChildren: () => import('./features/search/search.routes').then((m) => m.SEARCH_ROUTES)
      },
      {
        path: 'favorites',
        loadChildren: () => import('./features/favorites/favorites.routes').then((m) => m.FAVORITES_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
