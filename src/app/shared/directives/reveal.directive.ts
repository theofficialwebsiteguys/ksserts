import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

import { RevealObserverService } from '../services/reveal-observer.service';

/**
 * Adds a fade/rise-in transition the first time an element scrolls into view.
 * Pairs with the .reveal / .is-visible classes in styles/_utilities.scss,
 * which already collapse to a no-op under prefers-reduced-motion.
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: { class: 'reveal' }
})
export class RevealDirective implements AfterViewInit, OnDestroy {
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
