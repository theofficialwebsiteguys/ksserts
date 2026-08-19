import { Component } from '@angular/core';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  template: `
    <div class="product-card-skeleton">
      <div class="skeleton-block product-card-skeleton__image"></div>
      <div class="skeleton-block product-card-skeleton__line product-card-skeleton__line--title"></div>
      <div class="skeleton-block product-card-skeleton__line product-card-skeleton__line--price"></div>
    </div>
  `,
  styleUrl: './product-card-skeleton.component.scss'
})
export class ProductCardSkeletonComponent {}
