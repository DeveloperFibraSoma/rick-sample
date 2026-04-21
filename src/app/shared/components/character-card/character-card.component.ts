import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FallbackImageDirective } from '../../directives/fallback-image.directive';
import { CharacterListItem } from '../../../features/characters/models/character.model';
import { CharacterStatusPipe } from '../../pipes/character-status.pipe';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [FallbackImageDirective, CharacterStatusPipe],
  templateUrl: './character-card.component.html',
  styleUrl: './character-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterCardComponent {
  readonly character = input.required<CharacterListItem>();
  readonly favorite = output<CharacterListItem>();
  readonly open = output<number>();
  readonly isFavorite = input(false);
}
