import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CommerceApiService } from '../../core/api/commerce-api.service';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { CartLineInput } from '../../core/models/cart.model';
import { Product, ProductVariant } from '../../core/models/product.model';
import { formatMoney } from '../../core/utils/money.util';
import { getDietaryBadges } from '../../core/utils/dietary.util';
import { DietaryBadgesComponent } from '../../shared/components/dietary-badges/dietary-badges.component';
import { QuantitySelectorComponent } from '../../shared/components/quantity-selector/quantity-selector.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

interface BoxSelection {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

/** Picks the same variant a bare "quick add" would — first available, else the first variant. */
function primaryVariant(product: Product): ProductVariant | null {
  return product.variants.find((v) => v.availableForSale) ?? product.variants[0] ?? null;
}

/**
 * Every cookie is made to order — there's no real per-flavor stock to cap
 * against, so the only gate is whether Shopify currently allows selling
 * this variant at all (a deliberate merchant action, e.g. pausing a
 * flavor), not any tracked quantity.
 */
function isSellable(variant: ProductVariant): boolean {
  return variant.availableForSale;
}

@Component({
  selector: 'app-box-builder',
  standalone: true,
  imports: [RouterLink, DietaryBadgesComponent, QuantitySelectorComponent, ErrorStateComponent, EmptyStateComponent],
  templateUrl: './box-builder.component.html',
  styleUrl: './box-builder.component.scss'
})
export class BoxBuilderComponent implements OnInit {
  private readonly commerceApi = inject(CommerceApiService);
  protected readonly cartService = inject(CartService);
  private readonly seo = inject(SeoService);

  protected readonly formatMoney = formatMoney;
  protected readonly getDietaryBadges = getDietaryBadges;
  protected readonly sizes = environment.boxBuilder.sizes;

  protected loading = signal(true);
  protected error = signal(false);
  protected products = signal<Product[]>([]);

  protected boxSize = signal<number | null>(null);
  /** Keyed by product id — the only quantity state the picker needs. */
  private readonly selections = signal<Map<string, number>>(new Map());

  /** True while this box's own add-to-cart request is in flight. */
  protected readonly submitting = signal(false);

  protected readonly selectedItems = computed<BoxSelection[]>(() => {
    const map = this.selections();
    return this.products()
      .filter((product) => (map.get(product.id) ?? 0) > 0)
      .map((product) => ({ product, variant: primaryVariant(product)!, quantity: map.get(product.id)! }));
  });

  protected readonly totalSelected = computed(() => this.selectedItems().reduce((sum, item) => sum + item.quantity, 0));
  protected readonly remaining = computed(() => (this.boxSize() ?? 0) - this.totalSelected());
  protected readonly isComplete = computed(() => this.boxSize() !== null && this.remaining() === 0);
  private readonly totalPrice = computed(() =>
    this.selectedItems().reduce((sum, item) => sum + parseFloat(item.variant.price.amount) * item.quantity, 0)
  );
  private readonly currencyCode = computed(() => this.products()[0]?.priceRange.minVariantPrice.currencyCode ?? 'USD');
  protected readonly totalPriceDisplay = computed(() =>
    formatMoney({ amount: this.totalPrice().toFixed(2), currencyCode: this.currencyCode() })
  );

  ngOnInit(): void {
    this.seo.update({
      title: 'Build Your Own Box',
      description: "Pick your own mix of K'sserts cookies — choose a box size, then fill it with whatever flavors you love.",
      path: '/shop/build-a-box'
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.commerceApi
      .getCollection(environment.boxBuilder.collectionHandle)
      .pipe(catchError(() => of(null)))
      .subscribe((result) => {
        if (!result) {
          this.error.set(true);
        } else {
          this.products.set(result.products.filter((p) => primaryVariant(p)));
        }
        this.loading.set(false);
      });
  }

  chooseSize(size: number): void {
    this.boxSize.set(size);
    this.selections.set(new Map());
  }

  changeSize(): void {
    this.boxSize.set(null);
    this.selections.set(new Map());
  }

  quantityFor(product: Product): number {
    return this.selections().get(product.id) ?? 0;
  }

  /** A stepper's ceiling: zero if this flavor isn't currently sellable, otherwise only the box's remaining space. */
  maxFor(product: Product): number {
    const variant = primaryVariant(product);
    if (!variant || !isSellable(variant)) return 0;
    return this.quantityFor(product) + this.remaining();
  }

  setQuantity(product: Product, quantity: number): void {
    const clamped = Math.max(0, Math.min(quantity, this.maxFor(product)));
    this.selections.update((current) => {
      const next = new Map(current);
      if (clamped === 0) next.delete(product.id);
      else next.set(product.id, clamped);
      return next;
    });
  }

  addToCart(): void {
    if (!this.isComplete() || this.submitting()) return;
    const size = this.boxSize()!;
    const bundleId = crypto.randomUUID();
    const lines: CartLineInput[] = this.selectedItems().map((item) => ({
      variantId: item.variant.id,
      quantity: item.quantity,
      attributes: [
        { key: 'Box', value: `Box of ${size}` },
        { key: '_bundle_id', value: bundleId }
      ]
    }));

    this.submitting.set(true);
    this.cartService.addLines(lines).subscribe((cart) => {
      this.submitting.set(false);
      // Only resets the builder on success, so a failed request leaves the
      // customer's picks intact instead of making them rebuild the box.
      if (cart) {
        this.boxSize.set(null);
        this.selections.set(new Map());
      }
    });
  }
}
