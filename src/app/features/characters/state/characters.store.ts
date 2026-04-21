import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CharacterDetail, CharacterListItem, CharacterQuery, CharacterStatus } from '../models/character.model';
import { CharactersService } from '../services/characters.service';
import { FavoritesStore } from '../../favorites/state/favorites.store';

@Injectable({ providedIn: 'root' })
export class CharactersStore {
  private readonly characters = inject(CharactersService);
  private readonly favorites = inject(FavoritesStore);
  private readonly itemsState = signal<ReadonlyArray<CharacterListItem>>([]);
  private readonly totalState = signal(0);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<string | null>(null);
  private readonly detailState = signal<CharacterDetail | null>(null);
  private readonly detailLoadingState = signal(false);
  private readonly detailErrorState = signal<string | null>(null);

  readonly page = signal(1);
  readonly searchTerm = signal('');
  readonly status = signal<CharacterStatus | 'all'>('all');
  readonly items = this.itemsState.asReadonly();
  readonly total = this.totalState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly detail = this.detailState.asReadonly();
  readonly detailLoading = this.detailLoadingState.asReadonly();
  readonly detailError = this.detailErrorState.asReadonly();
  readonly pageSize = 8;
  private readonly debouncedSearchTerm = toSignal(
    toObservable(this.searchTerm).pipe(debounceTime(250), distinctUntilChanged()),
    { initialValue: '' }
  );
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalState() / this.pageSize)));
  readonly favoriteIds = this.favorites.favoriteIds;
  readonly activeQuery = computed<CharacterQuery>(() => ({
    page: this.page(),
    name: this.debouncedSearchTerm().trim() || undefined,
    status: this.status(),
    pageSize: this.pageSize
  }));

  constructor() {
    effect(() => {
      const query = this.activeQuery();
      this.loadList(query);
    }, { allowSignalWrites: true });
  }

  setPage(page: number): void {
    this.page.set(page);
  }

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.page.set(1);
  }

  setStatus(value: CharacterStatus | 'all'): void {
    this.status.set(value);
    this.page.set(1);
  }

  reload(): void {
    this.loadList(this.activeQuery());
  }

  loadDetail(id: number): void {
    this.detailLoadingState.set(true);
    this.detailErrorState.set(null);
    this.detailState.set(null);

    this.characters.detail(id).subscribe({
      next: (character) => {
        this.detailState.set(character);
        this.detailLoadingState.set(false);
      },
      error: (error: unknown) => {
        this.detailErrorState.set(normalizeError(error, 'Unable to load character detail'));
        this.detailLoadingState.set(false);
      }
    });
  }

  create(payload: Parameters<CharactersService['create']>[0]) {
    return this.characters.create(payload);
  }

  update(id: number, payload: Parameters<CharactersService['update']>[1]) {
    return this.characters.update(id, payload);
  }

  patch(id: number, payload: Parameters<CharactersService['patch']>[1]) {
    return this.characters.patch(id, payload);
  }

  delete(id: number) {
    return this.characters.delete(id);
  }

  toggleFavorite(item: CharacterListItem): void {
    this.favorites.toggle(item);
  }

  isFavorite(id: number): boolean {
    return this.favorites.has(id);
  }

  private loadList(query: CharacterQuery): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.characters.list(query).subscribe({
      next: (response) => {
        this.itemsState.set(response.results);
        this.totalState.set(response.info.count);
        this.loadingState.set(false);
      },
      error: (error: unknown) => {
        this.errorState.set(normalizeError(error, 'Unable to load characters'));
        this.loadingState.set(false);
      }
    });
  }
}

function normalizeError(error: unknown, fallback: string): string {
  return typeof error === 'object' && error !== null && 'message' in error ? String((error as { message: string }).message) : fallback;
}
