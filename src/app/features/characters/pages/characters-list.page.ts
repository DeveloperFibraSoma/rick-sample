import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CharacterStatus, CHARACTER_STATUS_OPTIONS } from '../models/character.model';
import { CharactersStore } from '../state/characters.store';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CharacterCardComponent } from '../../../shared/components/character-card/character-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  standalone: true,
  imports: [PageHeaderComponent, LoadingStateComponent, EmptyStateComponent, CharacterCardComponent, PaginationComponent],
  templateUrl: './characters-list.page.html',
  styleUrl: './characters-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharactersListPage {
  protected readonly store = inject(CharactersStore);
  private readonly router = inject(Router);
  protected readonly statuses = CHARACTER_STATUS_OPTIONS;
  private _currentPage = 1;

  get currentPage(): number {
    return this._currentPage;
  }

  set currentPage(page: number) {
    this._currentPage = page;
    this.store.setPage(page);
  }

  protected openCharacter(id: number): void {
    void this.router.navigate(['/characters', id]);
  }

  protected onStatusChange(value: string): void {
    this.store.setStatus(value as CharacterStatus | 'all');
  }

  protected toggleFavorite(id: number): void {
    const character = this.store.items().find((item) => item.id === id);
    if (character) {
      this.store.toggleFavorite(character);
    }
  }
}
