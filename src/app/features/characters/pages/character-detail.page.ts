import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CharactersStore } from '../state/characters.store';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CharacterDetailHeroComponent } from '../components/character-detail-hero.component';
import { CharacterEpisodeListComponent } from '../components/character-episode-list.component';

@Component({
  standalone: true,
  imports: [PageHeaderComponent, LoadingStateComponent, EmptyStateComponent, CharacterDetailHeroComponent, CharacterEpisodeListComponent],
  templateUrl: './character-detail.page.html',
  styleUrl: './character-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterDetailPage {
  protected readonly store = inject(CharactersStore);
  private readonly route = inject(ActivatedRoute);
  private readonly id = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: NaN }
  );

  constructor() {
    effect(() => {
      const id = this.id();
      if (Number.isFinite(id)) {
        this.store.loadDetail(id);
      }
    }, { allowSignalWrites: true });
  }

  protected goBack(): void {
    window.history.back();
  }

  protected toggleFavorite(): void {
    const current = this.store.detail();
    if (current) {
      this.store.toggleFavorite({
        id: current.id,
        name: current.name,
        status: current.status,
        species: current.species,
        gender: current.gender,
        image: current.image,
        origin: current.origin,
        location: current.location
      });
    }
  }
}
