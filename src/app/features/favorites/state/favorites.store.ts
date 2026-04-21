import { Injectable, computed, signal } from '@angular/core';
import { CharacterListItem } from '../../characters/models/character.model';

@Injectable({ providedIn: 'root' })
export class FavoritesStore {
  private readonly favoriteItems = signal<ReadonlyArray<CharacterListItem>>([]);

  readonly items = this.favoriteItems.asReadonly();
  readonly favoriteCount = computed(() => this.favoriteItems().length);
  readonly favoriteIds = computed(() => new Set(this.favoriteItems().map((item) => item.id)));

  has(id: number): boolean {
    return this.favoriteIds().has(id);
  }

  toggle(character: CharacterListItem): void {
    if (this.has(character.id)) {
      this.remove(character.id);
      return;
    }

    this.add(character);
  }

  add(character: CharacterListItem): void {
    this.favoriteItems.update((items) => {
      if (items.some((item) => item.id === character.id)) {
        return items;
      }

      return [character, ...items];
    });
  }

  remove(id: number): void {
    this.favoriteItems.update((items) => items.filter((item) => item.id !== id));
  }

  clear(): void {
    this.favoriteItems.set([]);
  }
}
