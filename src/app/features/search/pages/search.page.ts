import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { SearchStore } from '../state/search.store';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CharacterStatusPipe } from '../../../shared/pipes/character-status.pipe';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent, EmptyStateComponent, CharacterStatusPipe],
  templateUrl: './search.page.html',
  styleUrl: './search.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPage {
  protected readonly store = inject(SearchStore);
  private readonly router = inject(Router);
  readonly control = new FormControl('', { nonNullable: true });
  private readonly value = toSignal(this.control.valueChanges.pipe(startWith(this.control.value)), {
    initialValue: this.control.value
  });

  constructor() {
    effect(() => {
      this.store.setQuery(this.value());
    });
  }

  protected openCharacter(id: number): void {
    void this.router.navigate(['/characters', id]);
  }
}
