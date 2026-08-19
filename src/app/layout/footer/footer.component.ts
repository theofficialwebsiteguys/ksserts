import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LogoComponent } from '../../shared/components/logo/logo.component';
import { SocialLinksComponent } from '../../shared/components/social-links/social-links.component';
import { CutoutRevealDirective } from '../../shared/directives/cutout-reveal.directive';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LogoComponent, SocialLinksComponent, CutoutRevealDirective],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
