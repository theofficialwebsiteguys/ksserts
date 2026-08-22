import { Component, computed, effect, input, signal } from '@angular/core';

export type LogoVariant = 'full' | 'mark';
export type LogoTheme = 'light' | 'dark';

/**
 * Renders the K'sserts logo — wordmark + piping-bag mark + tagline ring,
 * on its own near-black backing (client-supplied art, matches the site's
 * dark theme so it sits flush against dark section backgrounds without a
 * visible box/circle around it). Falls back to a styled wordmark if the
 * real file is ever missing, so the site never shows a broken image icon.
 *
 * `variant`/`theme` are kept as inputs (harmlessly unused against the single
 * current asset) so a future horizontal lockup or icon-only mark can be
 * wired in per placement without touching call sites.
 */
@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    @if (!imgFailed()) {
      <img
        [src]="src()"
        [alt]="alt()"
        (error)="imgFailed.set(true)"
        class="app-logo"
        [class.app-logo--mark]="variant() === 'mark'"
        [attr.loading]="eager() ? null : 'lazy'"
        [attr.fetchpriority]="eager() ? 'high' : null"
      />
    } @else {
      <span class="app-logo-fallback" [class.app-logo-fallback--light]="theme() === 'dark'" [attr.aria-label]="alt()">
        <span class="app-logo-fallback__mark" aria-hidden="true">K</span>
        @if (variant() === 'full') {
          <span class="app-logo-fallback__word">K'sserts</span>
        }
      </span>
    }
  `,
  styleUrl: './logo.component.scss'
})
export class LogoComponent {
  variant = input<LogoVariant>('full');
  theme = input<LogoTheme>('dark');
  alt = input("K'sserts Cookie Café logo — a piping bag with a heart and the letter G, in memory of Gabriel");
  eager = input(false);

  protected imgFailed = signal(false);

  protected src = computed(() => 'assets/logo/dark-logo.png');

  constructor() {
    effect(() => {
      this.src();
      this.imgFailed.set(false);
    });
  }
}
