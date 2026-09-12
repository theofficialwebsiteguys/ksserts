import { Component } from '@angular/core';

import { RevealDirective } from '../../../../shared/directives/reveal.directive';

interface CafeAudience {
  label: string;
}

const AUDIENCES: CafeAudience[] = [
  { label: 'Coffee lovers' },
  { label: 'Families celebrating milestones' },
  { label: 'Friends reconnecting' },
  { label: 'Students studying' },
  { label: 'Neighbors gathering' }
];

@Component({
  selector: 'app-home-cookie-cafe',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './cookie-cafe.component.html',
  styleUrl: './cookie-cafe.component.scss'
})
export class CookieCafeComponent {
  protected readonly audiences = AUDIENCES;
}
