import { Component } from '@angular/core';

import { SocialLinksComponent } from '../../../../shared/components/social-links/social-links.component';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';
import { CutoutRevealDirective } from '../../../../shared/directives/cutout-reveal.directive';

@Component({
  selector: 'app-home-social',
  standalone: true,
  imports: [SocialLinksComponent, RevealDirective, CutoutRevealDirective],
  templateUrl: './social.component.html',
  styleUrl: './social.component.scss'
})
export class SocialComponent {}
