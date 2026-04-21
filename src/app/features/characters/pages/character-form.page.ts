import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  CHARACTER_GENDER_OPTIONS,
  CHARACTER_STATUS_OPTIONS,
  CharacterFormValue
} from '../models/character.model';
import { CharactersStore } from '../state/characters.store';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingStateComponent],
  templateUrl: './character-form.page.html',
  styleUrl: './character-form.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterFormPage {
  protected readonly store = inject(CharactersStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  readonly statuses = CHARACTER_STATUS_OPTIONS;
  readonly genders = CHARACTER_GENDER_OPTIONS;
  protected readonly id = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null }
  );

  readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    status: this.fb.control<'alive' | 'dead' | 'unknown'>('unknown', [Validators.required]),
    species: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    type: this.fb.control(''),
    gender: this.fb.control<'female' | 'male' | 'genderless' | 'unknown'>('unknown', [Validators.required]),
    originName: this.fb.control('Unknown'),
    locationName: this.fb.control('Unknown'),
    image: this.fb.control('assets/avatars/placeholder.svg', [Validators.required])
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) {
        return;
      }

      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        return;
      }

      this.store.loadDetail(numericId);
    }, { allowSignalWrites: true });

    effect(() => {
      const character = this.store.detail();
      if (!character) {
        return;
      }

      this.form.patchValue({
        name: character.name,
        status: character.status,
        species: character.species,
        type: character.type,
        gender: character.gender,
        originName: character.origin.name,
        locationName: character.location.name,
        image: character.image
      });
    }, { allowSignalWrites: true });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: CharacterFormValue = value;
    const request = this.id()
      ? this.store.update(Number(this.id()), {
          name: payload.name,
          status: payload.status,
          species: payload.species,
          type: payload.type,
          gender: payload.gender,
          origin: { name: payload.originName, url: '' },
          location: { name: payload.locationName, url: '' },
          image: payload.image
        })
      : this.store.create({
          name: payload.name,
          status: payload.status,
          species: payload.species,
          type: payload.type,
          gender: payload.gender,
          origin: { name: payload.originName, url: '' },
          location: { name: payload.locationName, url: '' },
          image: payload.image
        });

    request.subscribe({
      next: (character) => void this.router.navigate(['/characters', character.id]),
      error: () => this.form.setErrors({ saveFailed: true })
    });
  }
}
