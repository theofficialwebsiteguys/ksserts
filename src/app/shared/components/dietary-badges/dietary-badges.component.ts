import { Component, input } from '@angular/core';

import { DIETARY_BADGE_ICONS, DietaryBadge } from '../../../core/utils/dietary.util';

@Component({
  selector: 'app-dietary-badges',
  standalone: true,
  template: `
    @if (badges().length) {
      <ul
        class="dietary-badges"
        [class.dietary-badges--sm]="size() === 'sm'"
        [class.dietary-badges--circle]="variant() === 'circle'"
      >
        @for (badge of badges(); track badge.key) {
          <li class="dietary-badges__item" [attr.title]="variant() === 'circle' ? badge.label : null">
            @if (icons[badge.key]; as icon) {
              <img [src]="icon" alt="" class="dietary-badges__icon" />
            }
            @if (variant() === 'pill') {
              {{ badge.label }}
            } @else {
              <span class="visually-hidden">{{ badge.label }}</span>
            }
          </li>
        }
      </ul>
    }
  `,
  styleUrl: './dietary-badges.component.scss'
})
export class DietaryBadgesComponent {
  badges = input<DietaryBadge[]>([]);
  size = input<'sm' | 'md'>('md');
  /** 'pill' (default) is the existing text+icon chip used elsewhere; 'circle' is the icon-only badge used on shop product cards. */
  variant = input<'pill' | 'circle'>('pill');
  protected readonly icons = DIETARY_BADGE_ICONS;
}
