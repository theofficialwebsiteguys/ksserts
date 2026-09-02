import { Component, inject } from '@angular/core';

import { SeoService } from '../../core/services/seo.service';
import { HeroComponent } from './sections/hero/hero.component';
import { DietaryOptionsComponent } from './sections/dietary-options/dietary-options.component';
import { FeaturedProductsComponent } from './sections/featured-products/featured-products.component';
import { StoryPreviewComponent } from './sections/story-preview/story-preview.component';
import { MeaningComponent } from './sections/meaning/meaning.component';
import { MissionComponent } from './sections/mission/mission.component';
import { TestimonialsComponent } from './sections/testimonials/testimonials.component';
import { CookieCafeComponent } from './sections/cookie-cafe/cookie-cafe.component';
import { GoFundMeComponent } from './sections/gofundme/gofundme.component';
import { SocialComponent } from './sections/social/social.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    DietaryOptionsComponent,
    FeaturedProductsComponent,
    StoryPreviewComponent,
    MeaningComponent,
    MissionComponent,
    TestimonialsComponent,
    CookieCafeComponent,
    GoFundMeComponent,
    SocialComponent
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.update({
      title: "K'sserts Cookie Café | No One Left Out of Dessert",
      description:
        "Handcrafted gluten-free, vegan, and sugar-conscious desserts baked with love. Shop K'sserts Cookie Café and discover a dream built on inclusion.",
      path: '/'
    });
  }
}
