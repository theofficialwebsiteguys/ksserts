import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import { CommerceApiService } from '../../core/api/commerce-api.service';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { Product, ProductMetafield } from '../../core/models/product.model';
import { formatMoney } from '../../core/utils/money.util';
import { getDietaryBadges } from '../../core/utils/dietary.util';
import { DietaryBadgesComponent } from '../../shared/components/dietary-badges/dietary-badges.component';
import { QuantitySelectorComponent } from '../../shared/components/quantity-selector/quantity-selector.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

const JSON_LD_ID = 'product-jsonld';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [RouterLink, DietaryBadgesComponent, QuantitySelectorComponent, ProductCardComponent, ErrorStateComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly commerceApi = inject(CommerceApiService);
  protected readonly cartService = inject(CartService);
  private readonly seo = inject(SeoService);

  protected readonly formatMoney = formatMoney;

  protected product = signal<Product | null>(null);
  protected loading = signal(true);
  protected notFound = signal(false);
  protected error = signal(false);

  protected selectedOptions = signal<Record<string, string>>({});
  protected activeImageIndex = signal(0);
  protected quantity = signal(1);
  protected relatedProducts = signal<Product[]>([]);

  protected dietaryBadges = computed(() => (this.product() ? getDietaryBadges(this.product()!) : []));
  protected isGlutenFree = computed(() => this.dietaryBadges().some((badge) => badge.key === 'gluten-free'));

  protected selectedVariant = computed(() => {
    const product = this.product();
    if (!product) return null;
    const selection = this.selectedOptions();
    return product.variants.find((variant) => variant.selectedOptions.every((opt) => selection[opt.name] === opt.value)) ?? null;
  });

  protected activeImage = computed(() => this.product()?.images[this.activeImageIndex()] ?? null);

  /** Shopify gives products without real variants a single "Title: Default Title" option — hide that noise. */
  protected visibleOptions = computed(() => {
    const product = this.product();
    if (!product) return [];
    return product.options.filter((option) => !(option.name.toLowerCase() === 'title' && option.values.length === 1));
  });

  protected ingredientFields = computed<ProductMetafield[]>(
    () => this.product()?.metafields?.filter((field) => /ingredient/i.test(field.key)) ?? []
  );
  protected allergenFields = computed<ProductMetafield[]>(
    () => this.product()?.metafields?.filter((field) => /allerg/i.test(field.key)) ?? []
  );

  private readonly productSub = this.route.paramMap
    .pipe(
      switchMap((params) => {
        const handle = params.get('handle')!;
        this.loading.set(true);
        this.error.set(false);
        this.notFound.set(false);
        return this.commerceApi.getProduct(handle).pipe(
          catchError((err) => {
            if (err?.status === 404) this.notFound.set(true);
            else this.error.set(true);
            return of(null);
          })
        );
      })
    )
    .subscribe((product) => this.onProductLoaded(product));

  ngOnDestroy(): void {
    this.productSub.unsubscribe();
    this.seo.removeJsonLd(JSON_LD_ID);
  }

  selectOption(name: string, value: string): void {
    this.selectedOptions.update((current) => ({ ...current, [name]: value }));
  }

  setActiveImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  setQuantity(value: number): void {
    this.quantity.set(value);
  }

  addToCart(): void {
    const variant = this.selectedVariant();
    if (!variant || !variant.availableForSale) return;
    this.cartService.addLine(variant.id, this.quantity());
  }

  retry(): void {
    this.loading.set(true);
    this.error.set(false);
    const handle = this.route.snapshot.paramMap.get('handle')!;
    this.commerceApi
      .getProduct(handle)
      .pipe(
        catchError(() => {
          this.error.set(true);
          return of(null);
        })
      )
      .subscribe((product) => this.onProductLoaded(product));
  }

  private onProductLoaded(product: Product | null): void {
    this.loading.set(false);
    this.product.set(product);
    if (product) {
      this.initSelection(product);
      this.updateSeo(product);
      this.loadRelated(product);
    }
  }

  private initSelection(product: Product): void {
    const defaultVariant = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
    const initial: Record<string, string> = {};
    for (const opt of defaultVariant?.selectedOptions ?? []) initial[opt.name] = opt.value;
    this.selectedOptions.set(initial);
    this.quantity.set(1);
    this.activeImageIndex.set(0);
  }

  private loadRelated(product: Product): void {
    this.commerceApi
      .getAllProducts()
      .pipe(catchError(() => of(null)))
      .subscribe((response) => {
        if (!response) {
          this.relatedProducts.set([]);
          return;
        }
        const others = response.products.filter((p) => p.id !== product.id);
        const sameTag = others.filter((p) => p.tags.some((tag) => product.tags.includes(tag)));
        const pool = sameTag.length > 0 ? sameTag : others;
        this.relatedProducts.set(pool.slice(0, 4));
      });
  }

  private updateSeo(product: Product): void {
    const description = product.description
      ? product.description.slice(0, 155)
      : `Shop ${product.title} from K'sserts Cookie Café.`;
    const image = product.images[0]?.url;

    this.seo.update({
      title: product.title,
      description,
      path: `/shop/${product.handle}`,
      image,
      type: 'product'
    });

    this.seo.setJsonLd(JSON_LD_ID, {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      image: product.images.map((img) => img.url),
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: product.priceRange.minVariantPrice.currencyCode,
        lowPrice: product.priceRange.minVariantPrice.amount,
        highPrice: product.priceRange.maxVariantPrice.amount,
        availability: product.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
      }
    });
  }
}
