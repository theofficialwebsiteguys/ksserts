import { Component, input } from '@angular/core';

import { DietaryBadge } from '../../../core/utils/dietary.util';

@Component({
  selector: 'app-dietary-badges',
  standalone: true,
  template: `
    @if (badges().length) {
      <ul class="dietary-badges" [class.dietary-badges--sm]="size() === 'sm'">
        @for (badge of badges(); track badge.key) {
          <li class="dietary-badges__item">{{ badge.label }}</li>
        }
      </ul>
    }
  `,
  styleUrl: './dietary-badges.component.scss'
})
export class DietaryBadgesComponent {
  badges = input<DietaryBadge[]>([]);
  size = input<'sm' | 'md'>('md');
}
