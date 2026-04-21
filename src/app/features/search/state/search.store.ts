import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { CharacterListItem } from '../../characters/models/character.model';
import { CharactersService } from '../../characters/services/characters.service';

@Injectable({ providedIn: 'root' })
export class SearchStore {
  private readonly characters = inject(CharactersService);
  readonly query = signal('');
  readonly queryLength = computed(() => this.query().trim().length);
  readonly hasQuery = computed(() => this.queryLength() > 1);
  readonly suggestions = toSignal(
    toObservable(this.query).pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((query) => {
        const term = query.trim();
        if (term.length < 2) {
          return of([] as ReadonlyArray<CharacterListItem>);
        }

        return this.characters.search(term);
      })
    ),
    { initialValue: [] as ReadonlyArray<CharacterListItem> }
  );

  setQuery(value: string): void {
    this.query.set(value);
  }
}
