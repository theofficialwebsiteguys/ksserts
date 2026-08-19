import { Injectable } from '@angular/core';

/**
 * Backs RevealDirective with a single shared IntersectionObserver instead of
 * one per element — a page can have dozens of reveal-on-scroll elements.
 */
@Injectable({ providedIn: 'root' })
export class RevealObserverService {
  private observer?: IntersectionObserver;
  private readonly callbacks = new Map<Element, () => void>();

  observe(el: Element, onVisible: () => void): void {
    if (typeof IntersectionObserver === 'undefined') {
      onVisible();
      return;
    }
    this.callbacks.set(el, onVisible);
    this.getObserver().observe(el);
  }

  unobserve(el: Element): void {
    this.callbacks.delete(el);
    this.observer?.unobserve(el);
  }

  private getObserver(): IntersectionObserver {
    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.callbacks.get(entry.target)?.();
              this.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
      );
    }
    return this.observer;
  }
}
