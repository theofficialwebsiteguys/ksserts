import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import { formatMoney, formatPriceRange } from '../../../core/utils/money.util';
import { getDietaryBadges } from '../../../core/utils/dietary.util';
import { getDietLabel } from '../../../core/utils/product-grouping.util';
import { DietaryBadgesComponent } from '../dietary-badges/dietary-badges.component';
import { QuantitySelectorComponent } from '../quantity-selector/quantity-selector.component';

/** What a `GroupedProduct` (see product-grouping.util) actually looks like — this component only needs `members`. */
type ProductWithMembers = Product & { members?: Product[] };

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, DietaryBadgesComponent, QuantitySelectorComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  protected readonly cartService = inject(CartService);
  protected readonly formatMoney = formatMoney;
  protected readonly dietLabel = getDietLabel;

  product = input.required<Product>();

  protected primaryImage = computed(() => this.product().images[0] ?? null);
  protected available = computed(() => this.product().availableForSale);
  protected dietaryBadges = computed(() => getDietaryBadges(this.product()));
  protected priceDisplay = computed(() => formatPriceRange(this.product().priceRange));

  /** Same-flavor diet variants (see product-grouping.util) — each gets its own price and Add to Cart, no drilling in required. */
  protected groupOptions = computed<Product[] | null>(() => {
    const members = (this.product() as ProductWithMembers).members;
    return members && members.length > 1 ? members : null;
  });

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

  /** This card's own in-flight state — not `cartService.loading()`, which is shared across every card on the page. */
  protected adding = signal(false);

  /** Price/Add to Cart are hidden until tapped, per client design — collapsed by default. */
  protected expanded = signal(false);

  /** Per-diet-option quantity, keyed by that option's product id. Defaults to 1 until touched. */
  private readonly optionQuantities = signal<Record<string, number>>({});

  /** Per-diet-option in-flight state, keyed by product id — same reasoning as `adding`. */
  private readonly busyOptionIds = signal<Set<string>>(new Set());

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }

  quickAdd(): void {
    if (this.adding()) return;
    const variant = this.product().variants[0];
    if (!variant) return;
    this.adding.set(true);
    this.cartService.addLine(variant.id, 1).subscribe(() => this.adding.set(false));
  }

  getOptionQuantity(optionId: string): number {
    return this.optionQuantities()[optionId] ?? 1;
  }

  setOptionQuantity(optionId: string, value: number): void {
    this.optionQuantities.update((current) => ({ ...current, [optionId]: value }));
  }

  isOptionBusy(optionId: string): boolean {
    return this.busyOptionIds().has(optionId);
  }

  addOption(option: Product): void {
    if (this.isOptionBusy(option.id)) return;
    const variant = option.variants[0];
    if (!variant) return;
    const quantity = this.getOptionQuantity(option.id);
    this.busyOptionIds.update((current) => new Set(current).add(option.id));
    this.cartService.addLine(variant.id, quantity).subscribe(() => {
      this.busyOptionIds.update((current) => {
        const next = new Set(current);
        next.delete(option.id);
        return next;
      });
    });
  }
}
