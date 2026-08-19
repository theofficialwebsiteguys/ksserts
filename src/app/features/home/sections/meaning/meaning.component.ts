import { Component } from '@angular/core';

import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';
import { CutoutRevealDirective } from '../../../../shared/directives/cutout-reveal.directive';

@Component({
  selector: 'app-home-meaning',
  standalone: true,
  imports: [LogoComponent, RevealDirective, CutoutRevealDirective],
  templateUrl: './meaning.component.html',
  styleUrl: './meaning.component.scss'
})
export class MeaningComponent {}
