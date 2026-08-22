import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {}
