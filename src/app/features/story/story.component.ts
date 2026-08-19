import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { CommerceApiService } from '../../core/api/commerce-api.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductImage } from '../../core/models/product.model';
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
export class StoryComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly commerceApi = inject(CommerceApiService);

  protected photoBreak = signal<ProductImage[]>([]);

  constructor() {
    this.seo.update({
      title: 'Our Story',
      description:
        "Karina founded K'sserts in memory of her father, Gabriel, baking gluten-free, vegan, and sugar-conscious desserts so no one is left out of dessert.",
      path: '/our-story',
      type: 'article'
    });
  }

  ngOnInit(): void {
    this.commerceApi
      .getShowcaseImages(2, 9)
      .pipe(catchError(() => of([])))
      .subscribe((images) => this.photoBreak.set(images));
  }
}
