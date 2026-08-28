import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SeoService } from '../../core/services/seo.service';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { CutoutRevealDirective } from '../../shared/directives/cutout-reveal.directive';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [RouterLink, LogoComponent, RevealDirective, CutoutRevealDirective],
  templateUrl: './story.component.html',
  styleUrl: './story.component.scss'
})
export class StoryComponent {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.update({
      title: 'Our Story',
      description:
        "Karina founded K'sserts in memory of her father, Gabriel, baking gluten-free, vegan, and sugar-conscious desserts so no one is left out of dessert.",
      path: '/our-story',
      type: 'article'
    });
  }
}
