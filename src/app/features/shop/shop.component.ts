import { Component, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';

import { CommerceApiService } from '../../core/api/commerce-api.service';
import { SeoService } from '../../core/services/seo.service';
import { Collection } from '../../core/models/collection.model';
import { Product } from '../../core/models/product.model';
import { DietaryTagKey, getAvailableDietaryFilters, getDietaryBadges } from '../../core/utils/dietary.util';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card-skeleton/product-card-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { CutoutRevealDirective } from '../../shared/directives/cutout-reveal.directive';

type SortKey = 'title-asc' | 'title-desc' | 'price-asc' | 'price-desc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'title-asc', label: 'Name: A to Z' },
  { value: 'title-desc', label: 'Name: Z to A' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' }
];

const PAGE_SIZE = 12;

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    ProductCardComponent,
    ProductCardSkeletonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    CutoutRevealDirective
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {
  private readonly commerceApi = inject(CommerceApiService);
  private readonly seo = inject(SeoService);

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly skeletonCount = Array.from({ length: PAGE_SIZE });

  protected allProducts = signal<Product[]>([]);
  protected collections = signal<Collection[]>([]);
  protected loading = signal(true);
  protected error = signal(false);

  protected selectedCollection = signal<string | null>(null);
  protected selectedDietary = signal<Set<DietaryTagKey>>(new Set());
  protected availableOnly = signal(false);
  protected searchTerm = signal('');
  protected sortKey = signal<SortKey>('title-asc');
  protected visibleCount = signal(PAGE_SIZE);
  protected mobileFiltersOpen = signal(false);

  protected availableDietaryFilters = computed(() => getAvailableDietaryFilters(this.allProducts()));

  protected hasActiveFilters = computed(
    () => !!this.selectedCollection() || this.selectedDietary().size > 0 || this.availableOnly() || !!this.searchTerm()
  );

  protected filteredProducts = computed(() => {
    const collection = this.selectedCollection();
    const dietary = this.selectedDietary();
    const availableOnly = this.availableOnly();
    const search = this.searchTerm().trim().toLowerCase();
    const sort = this.sortKey();

    let results = this.allProducts().filter((product) => {
      if (collection && !product.collections?.includes(collection)) return false;
      if (availableOnly && !product.availableForSale) return false;
      if (dietary.size > 0) {
        const badges = getDietaryBadges(product);
        if (!badges.some((badge) => dietary.has(badge.key))) return false;
      }
      if (search) {
        const haystack = [product.title, product.productType ?? '', ...product.tags].join(' ').toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    results = [...results].sort((a, b) => {
      switch (sort) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'price-asc':
          return parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount);
        case 'price-desc':
          return parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount);
      }
    });

    return results;
  });

  protected visibleProducts = computed(() => this.filteredProducts().slice(0, this.visibleCount()));
  protected hasMore = computed(() => this.filteredProducts().length > this.visibleCount());

  constructor() {
    this.seo.update({
      title: 'Shop',
      description:
        "Shop K'sserts Cookie Café for handcrafted cookies and desserts, with gluten-free, vegan, and sugar-conscious options for every celebration.",
      path: '/shop'
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);

    forkJoin({
      products: this.commerceApi.getAllProducts().pipe(catchError(() => of(null))),
      collections: this.commerceApi.getCollections().pipe(catchError(() => of([] as Collection[])))
    }).subscribe(({ products, collections }) => {
      if (!products) {
        this.error.set(true);
      } else {
        this.allProducts.set(products.products);
      }
      this.collections.set(collections);
      this.loading.set(false);
    });
  }

  setCollection(handle: string | null): void {
    this.selectedCollection.set(handle);
    this.resetPagination();
  }

  toggleDietary(key: DietaryTagKey): void {
    const next = new Set(this.selectedDietary());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.selectedDietary.set(next);
    this.resetPagination();
  }

  toggleAvailableOnly(): void {
    this.availableOnly.update((v) => !v);
    this.resetPagination();
  }

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.resetPagination();
  }

  onSortChange(event: Event): void {
    this.sortKey.set((event.target as HTMLSelectElement).value as SortKey);
  }

  clearFilters(): void {
    this.selectedCollection.set(null);
    this.selectedDietary.set(new Set());
    this.availableOnly.set(false);
    this.searchTerm.set('');
    this.resetPagination();
  }

  loadMore(): void {
    this.visibleCount.update((v) => v + PAGE_SIZE);
  }

  toggleMobileFilters(): void {
    this.mobileFiltersOpen.update((v) => !v);
  }

  private resetPagination(): void {
    this.visibleCount.set(PAGE_SIZE);
  }
}
