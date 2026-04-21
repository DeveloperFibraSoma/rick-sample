import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
  readonly eyebrow = input<string>('Overview');
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}
