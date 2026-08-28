import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RevealDirective } from '../../../../shared/directives/reveal.directive';
import { CutoutRevealDirective } from '../../../../shared/directives/cutout-reveal.directive';

interface DietaryOption {
  title: string;
  description: string;
  /** Real client-supplied badge art (public/assets/badges/). */
  imageSrc?: string;
  /** Hand-drawn fallback icon, only for options with no badge art. */
  icon?: 'specialty';
}

const OPTIONS: DietaryOption[] = [
  {
    title: 'Gluten Free',
    description: 'Baked without wheat, so guests avoiding gluten can still dig into something delicious.',
    imageSrc: 'assets/badges/gluten-free.png'
  },
  {
    title: 'Vegan',
    description: 'Plant-based treats made without dairy or eggs, without sacrificing flavor or texture.',
    imageSrc: 'assets/badges/vegan.png'
  },
  {
    title: 'Diabetic Friendly',
    description: 'Thoughtfully developed for guests managing diabetes or watching their sugar intake.',
    imageSrc: 'assets/badges/diabetic-friendly.png'
  },
  {
    title: 'Specialty Desserts',
    description: 'Almond-flour bakes and other specialty recipes crafted with care for particular needs.',
    icon: 'specialty'
  }
];

@Component({
  selector: 'app-home-dietary-options',
  standalone: true,
  imports: [RouterLink, RevealDirective, CutoutRevealDirective],
  templateUrl: './dietary-options.component.html',
  styleUrl: './dietary-options.component.scss'
})
export class DietaryOptionsComponent {
  protected readonly options = OPTIONS;
}
