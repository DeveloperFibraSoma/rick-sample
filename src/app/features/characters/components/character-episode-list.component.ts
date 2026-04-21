import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-character-episode-list',
  standalone: true,
  templateUrl: './character-episode-list.component.html',
  styleUrl: './character-episode-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterEpisodeListComponent {
  readonly episodes = input<ReadonlyArray<string>>([]);
}
