import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  readonly currentPage = model(1);
  readonly totalPages = input(1);

  previous(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  next(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }
}
