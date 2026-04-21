import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FallbackImageDirective } from '../../../shared/directives/fallback-image.directive';
import { CharacterDetail } from '../models/character.model';
import { CharacterStatusPipe } from '../../../shared/pipes/character-status.pipe';

@Component({
  selector: 'app-character-detail-hero',
  standalone: true,
  imports: [FallbackImageDirective, CharacterStatusPipe],
  templateUrl: './character-detail-hero.component.html',
  styleUrl: './character-detail-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterDetailHeroComponent {
  readonly character = input.required<CharacterDetail>();
  readonly favorite = output<void>();
  readonly isFavorite = input(false);
}
