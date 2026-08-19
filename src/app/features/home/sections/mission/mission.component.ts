import { Component } from '@angular/core';

import { RevealDirective } from '../../../../shared/directives/reveal.directive';
import { CutoutRevealDirective } from '../../../../shared/directives/cutout-reveal.directive';

@Component({
  selector: 'app-home-mission',
  standalone: true,
  imports: [RevealDirective, CutoutRevealDirective],
  templateUrl: './mission.component.html',
  styleUrl: './mission.component.scss'
})
export class MissionComponent {}
