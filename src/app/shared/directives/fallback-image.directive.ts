import { Directive, HostListener, input } from '@angular/core';

@Directive({
  selector: 'img[appFallbackImage]',
  standalone: true
})
export class FallbackImageDirective {
  readonly fallback = input('assets/avatars/placeholder.svg', { alias: 'appFallbackImage' });

  @HostListener('error', ['$event'])
  onError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (image) {
      image.src = this.fallback();
    }
  }
}
