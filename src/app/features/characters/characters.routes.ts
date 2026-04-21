import { Routes } from '@angular/router';

export const CHARACTERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/characters-list.page').then((m) => m.CharactersListPage)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/character-form.page').then((m) => m.CharacterFormPage)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/character-form.page').then((m) => m.CharacterFormPage)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/character-detail.page').then((m) => m.CharacterDetailPage)
  }
];
