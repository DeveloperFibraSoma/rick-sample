import { Pipe, PipeTransform } from '@angular/core';
import { CharacterStatus } from '../../features/characters/models/character.model';

const STATUS_LABELS: Readonly<Record<CharacterStatus, string>> = {
  alive: 'Vivo',
  dead: 'Muerto',
  unknown: 'Desconocido'
};

@Pipe({
  name: 'characterStatus',
  standalone: true
})
export class CharacterStatusPipe implements PipeTransform {
  transform(value: CharacterStatus): string {
    return STATUS_LABELS[value] ?? 'Desconocido';
  }
}
