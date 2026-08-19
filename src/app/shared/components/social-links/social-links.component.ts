import { Component, input } from '@angular/core';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-social-links',
  standalone: true,
  template: `
    <ul class="social-links" [class.social-links--lg]="size() === 'lg'">
      <li>
        <a
          [href]="social.instagramUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="K'sserts Cookie Café on Instagram (opens in a new tab)"
          class="social-links__link"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" stroke-width="1.6" />
            <circle cx="12" cy="12" r="4.6" stroke="currentColor" stroke-width="1.6" />
            <circle cx="17.35" cy="6.65" r="1.15" fill="currentColor" />
          </svg>
        </a>
      </li>
      <li>
        <a
          [href]="social.facebookUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="K'sserts Cookie Café on Facebook (opens in a new tab)"
          class="social-links__link"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15.5 8.5h2V5.2c-.35-.05-1.54-.15-2.94-.15-2.9 0-4.9 1.77-4.9 5.02v2.68H6.75v3.7h2.9V21.5h3.72v-6.05h2.87l.46-3.7h-3.33V10.4c0-1.07.29-1.9 2.13-1.9Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </li>
    </ul>
  `,
  styleUrl: './social-links.component.scss'
})
export class SocialLinksComponent {
  size = input<'md' | 'lg'>('md');
  protected readonly social = environment.social;
}
