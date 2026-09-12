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
  /** gf-vegan.png is a wide pill graphic, not a square/circle badge — needs its own wider chip to render at full size instead of being letterboxed. */
  wide?: boolean;
}

const OPTIONS: DietaryOption[] = [
  {
    title: 'Gluten Free',
    description: 'Made without gluten-containing ingredients and crafted to be every bit as indulgent.',
    imageSrc: 'assets/badges/gluten-free.png'
  },
  {
    title: 'Vegan',
    description: 'Made without dairy or eggs, but never without the rich flavor and texture you crave.',
    imageSrc: 'assets/badges/vegan.png'
  },
  {
    title: 'Diabetic Friendly',
    description: 'Thoughtfully made without added sugar—because everyone deserves something sweet.',
    imageSrc: 'assets/badges/diabetic-friendly.png'
  },
  {
    title: 'Gluten-Free + Vegan',
    description: 'Made without gluten-containing ingredients, dairy, or eggs because more options should never mean less flavor.',
    imageSrc: 'assets/badges/gf-vegan.png',
    wide: true
  },
  {
    title: 'Specialty Desserts',
    description: 'Made without gluten-containing ingredients, dairy, or eggs—because more options should never mean less flavor',
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
