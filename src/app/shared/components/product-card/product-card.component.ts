import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import { formatMoney, formatPriceRange } from '../../../core/utils/money.util';
import { getDietaryBadges } from '../../../core/utils/dietary.util';
import { DietaryBadgesComponent } from '../dietary-badges/dietary-badges.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, DietaryBadgesComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  protected readonly cartService = inject(CartService);

  product = input.required<Product>();

  protected primaryImage = computed(() => this.product().images[0] ?? null);
  protected available = computed(() => this.product().availableForSale);
  protected dietaryBadges = computed(() => getDietaryBadges(this.product()));
  protected priceDisplay = computed(() => formatPriceRange(this.product().priceRange));

  protected onSale = computed(() => {
    const compareRange = this.product().compareAtPriceRange;
    if (!compareRange) return false;
    return parseFloat(compareRange.minVariantPrice.amount) > parseFloat(this.product().priceRange.minVariantPrice.amount);
  });

  protected compareAtDisplay = computed(() => {
    if (!this.onSale()) return null;
    return formatMoney(this.product().compareAtPriceRange!.minVariantPrice);
  });

  /** Only offer one-tap add when there's a single, unambiguous variant to add. */
  protected canQuickAdd = computed(() => this.available() && this.product().variants.length === 1);

  quickAdd(): void {
    const variant = this.product().variants[0];
    if (!variant) return;
    this.cartService.addLine(variant.id, 1);
  }
}
