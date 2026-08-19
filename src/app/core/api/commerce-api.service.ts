import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Collection, CollectionWithProducts } from '../models/collection.model';
import { Product, ProductImage, ProductListResponse, ProductQueryParams } from '../models/product.model';

/**
 * Talks to the reusable central Shopify commerce API — never to Shopify directly.
 * All routes are scoped under {commerceApiUrl}/{storeKey}/...
 *
 * Assumed contract (adjust paths here if the live API differs — this is the
 * only file that should need to change):
 *   GET  /{storeKey}/products?search=&collection=&limit=&cursor=&availableOnly=
 *   GET  /{storeKey}/products/{handle}
 *   GET  /{storeKey}/collections
 *   GET  /{storeKey}/collections/{handle}?limit=
 */
@Injectable({ providedIn: 'root' })
export class CommerceApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.commerceApiUrl}/${environment.storeKey}`;

  private productListCache$?: Observable<ProductListResponse>;
  private collectionsCache$?: Observable<Collection[]>;

  /** Full catalog fetch, cached for the session. Filtering/sorting happens client-side in the shop UI. */
  getAllProducts(limit = 250): Observable<ProductListResponse> {
    if (!this.productListCache$) {
      this.productListCache$ = this.getProducts({ limit }).pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }
    return this.productListCache$;
  }

  getProducts(params: ProductQueryParams = {}): Observable<ProductListResponse> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.collection) httpParams = httpParams.set('collection', params.collection);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.cursor) httpParams = httpParams.set('cursor', params.cursor);
    if (params.availableOnly) httpParams = httpParams.set('availableOnly', 'true');

    return this.http.get<ProductListResponse>(`${this.base}/products`, { params: httpParams });
  }

  getProduct(handle: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${encodeURIComponent(handle)}`);
  }

  getCollections(): Observable<Collection[]> {
    if (!this.collectionsCache$) {
      this.collectionsCache$ = this.http
        .get<Collection[]>(`${this.base}/collections`)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }
    return this.collectionsCache$;
  }

  getCollection(handle: string, limit = 100): Observable<CollectionWithProducts> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<CollectionWithProducts>(`${this.base}/collections/${encodeURIComponent(handle)}`, {
      params
    });
  }

  /**
   * Real product photography for decorative placements (Cookie Café visual,
   * Our Story accents, etc.) — never a stock/placeholder image. Reuses the
   * cached catalog fetch, so this is free once getAllProducts() has run.
   * `offset` lets different sections draw from different parts of the
   * catalog on the same page so they don't all show the same photos.
   */
  getShowcaseImages(count: number, offset = 0): Observable<ProductImage[]> {
    return this.getAllProducts().pipe(
      map((response) => {
        const images = response.products.map((p) => p.images[0]).filter((img): img is ProductImage => !!img);
        if (images.length === 0) return [];
        const start = offset % images.length;
        const rotated = [...images.slice(start), ...images.slice(0, start)];
        return rotated.slice(0, count);
      })
    );
  }
}
