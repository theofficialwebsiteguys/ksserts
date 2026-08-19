import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

import { RevealObserverService } from '../services/reveal-observer.service';

/**
 * Same shared-observer scroll-in mechanism as RevealDirective, but for the
 * decorative dessert cutouts scattered around the page — pairs with the
 * .site-cutout / .is-visible classes (scale+rotate or edge-slide, see
 * styles/_utilities.scss) instead of .reveal's simple fade+rise, so a photo
 * and a text block never fight over the same "reveal" animation shape.
 */
@Directive({
  selector: '[appCutoutReveal]',
  standalone: true,
  host: { class: 'site-cutout' }
})
export class CutoutRevealDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly revealObserver = inject(RevealObserverService);

  ngAfterViewInit(): void {
    this.revealObserver.observe(this.el.nativeElement, () => {
      this.el.nativeElement.classList.add('is-visible');
    });
  }

  ngOnDestroy(): void {
    this.revealObserver.unobserve(this.el.nativeElement);
  }
}
