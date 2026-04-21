import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FavoritesStore } from '../state/favorites.store';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CharacterCardComponent } from '../../../shared/components/character-card/character-card.component';

@Component({
  standalone: true,
  imports: [PageHeaderComponent, EmptyStateComponent, CharacterCardComponent],
  templateUrl: './favorites.page.html',
  styleUrl: './favorites.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoritesPage {
  protected readonly store = inject(FavoritesStore);
  private readonly router = inject(Router);

  protected openCharacter(id: number): void {
    void this.router.navigate(['/characters', id]);
  }
}
