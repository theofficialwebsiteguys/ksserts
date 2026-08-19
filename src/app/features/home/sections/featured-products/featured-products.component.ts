import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { CommerceApiService } from '../../../../core/api/commerce-api.service';
import { Product } from '../../../../core/models/product.model';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../../../shared/components/product-card-skeleton/product-card-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

const FEATURED_COUNT = 8;

@Component({
  selector: 'app-home-featured-products',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, ProductCardSkeletonComponent, EmptyStateComponent, ErrorStateComponent, RevealDirective],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.scss'
})
export class FeaturedProductsComponent implements OnInit {
  private readonly commerceApi = inject(CommerceApiService);

  protected products = signal<Product[]>([]);
  protected loading = signal(true);
  protected error = signal(false);
  protected readonly skeletonCount = Array.from({ length: FEATURED_COUNT });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.commerceApi
      .getAllProducts()
      .pipe(
        catchError(() => {
          this.error.set(true);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this.products.set(response.products.slice(0, FEATURED_COUNT));
        }
        this.loading.set(false);
      });
  }
}
