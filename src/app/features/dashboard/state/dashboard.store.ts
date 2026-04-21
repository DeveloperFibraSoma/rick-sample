import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { CharactersService } from '../../characters/services/characters.service';
import { FavoritesStore } from '../../favorites/state/favorites.store';
import { CharacterDashboardMetrics } from '../../characters/models/character.model';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly characters = inject(CharactersService);
  private readonly favorites = inject(FavoritesStore);
  private readonly metricsState = signal<CharacterDashboardMetrics | null>(null);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<string | null>(null);

  readonly metrics = this.metricsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly favoriteCount = computed(() => this.favorites.favoriteCount());
  readonly cards = computed(() => {
    const metrics = this.metricsState();
    if (!metrics) {
      return [];
    }

    return [
      { label: 'Total characters', value: metrics.total, note: 'Indexed in the local mock store', tone: 'accent' as const },
      { label: 'Alive', value: metrics.alive, note: 'Characters currently alive', tone: 'success' as const },
      { label: 'Dead', value: metrics.dead, note: 'Characters with a dead status', tone: 'warning' as const },
      { label: 'Favorites', value: this.favoriteCount(), note: 'Local in-memory collection', tone: 'neutral' as const }
    ];
  });

  constructor() {
    effect(() => {
      this.load();
    }, { allowSignalWrites: true });
  }

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.characters.metrics().subscribe({
      next: (metrics) => {
        this.metricsState.set(metrics);
        this.loadingState.set(false);
      },
      error: (error: unknown) => {
        this.errorState.set(normalizeError(error));
        this.loadingState.set(false);
      }
    });
  }
}

function normalizeError(error: unknown): string {
  return typeof error === 'object' && error !== null && 'message' in error ? String((error as { message: string }).message) : 'Unable to load dashboard';
}
