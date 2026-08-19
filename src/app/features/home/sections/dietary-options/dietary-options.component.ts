import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RevealDirective } from '../../../../shared/directives/reveal.directive';
import { CutoutRevealDirective } from '../../../../shared/directives/cutout-reveal.directive';

interface DietaryOption {
  title: string;
  description: string;
  icon: 'gluten-free' | 'vegan' | 'sugar-conscious' | 'specialty';
}

const OPTIONS: DietaryOption[] = [
  {
    title: 'Gluten Free',
    description: 'Baked without wheat, so guests avoiding gluten can still dig into something delicious.',
    icon: 'gluten-free'
  },
  {
    title: 'Vegan',
    description: 'Plant-based treats made without dairy or eggs, without sacrificing flavor or texture.',
    icon: 'vegan'
  },
  {
    title: 'Sugar Conscious',
    description: 'Thoughtfully developed for guests watching their sugar intake, including those managing diabetes.',
    icon: 'sugar-conscious'
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
