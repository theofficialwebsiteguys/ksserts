import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Cart } from '../models/cart.model';

const STORAGE_KEY = 'ksserts_cart_id';

/**
 * Owns the Shopify cart lifecycle via the central commerce API.
 * Assumed contract (adjust here if the live API differs):
 *   POST   /{storeKey}/cart                         { lines: [{ variantId, quantity }] } -> Cart
 *   GET    /{storeKey}/cart/{cartId}                                                     -> Cart
 *   POST   /{storeKey}/cart/{cartId}/lines           { variantId, quantity }              -> Cart
 *   PATCH  /{storeKey}/cart/{cartId}/lines/{lineId}  { quantity }                         -> Cart
 *   DELETE /{storeKey}/cart/{cartId}/lines/{lineId}                                       -> Cart
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly base = `${environment.commerceApiUrl}/${environment.storeKey}/cart`;

  readonly cart = signal<Cart | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isOpen = signal(false);

  readonly totalQuantity = computed(() => this.cart()?.totalQuantity ?? 0);

  constructor() {
    const existingId = this.readStoredCartId();
    if (existingId) {
      this.loading.set(true);
      this.http
        .get<Cart>(`${this.base}/${existingId}`)
        .pipe(
          catchError(() => {
            this.clearStoredCartId();
            return of(null);
          })
        )
        .subscribe((cart) => {
          this.cart.set(cart);
          this.loading.set(false);
        });
    }
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  addLine(variantId: string, quantity = 1): void {
    this.error.set(null);
    this.loading.set(true);
    const cartId = this.cart()?.id ?? this.readStoredCartId();

    const request$ = cartId
      ? this.http.post<Cart>(`${this.base}/${cartId}/lines`, { variantId, quantity })
      : this.http.post<Cart>(this.base, { lines: [{ variantId, quantity }] });

    request$
      .pipe(
        tap((cart) => this.storeCartId(cart.id)),
        catchError(() => {
          this.error.set("We couldn't add that item to your cart. Please try again.");
          return of(null);
        })
      )
      .subscribe((cart) => {
        if (cart) {
          this.cart.set(cart);
          this.isOpen.set(true);
        }
        this.loading.set(false);
      });
  }

  updateLineQuantity(lineId: string, quantity: number): void {
    const cartId = this.cart()?.id;
    if (!cartId) return;
    this.error.set(null);
    this.loading.set(true);

    this.http
      .patch<Cart>(`${this.base}/${cartId}/lines/${lineId}`, { quantity })
      .pipe(
        catchError(() => {
          this.error.set("We couldn't update that item. Please try again.");
          return of(null);
        })
      )
      .subscribe((cart) => {
        if (cart) this.cart.set(cart);
        this.loading.set(false);
      });
  }

  removeLine(lineId: string): void {
    const cartId = this.cart()?.id;
    if (!cartId) return;
    this.error.set(null);
    this.loading.set(true);

    this.http
      .delete<Cart>(`${this.base}/${cartId}/lines/${lineId}`)
      .pipe(
        catchError(() => {
          this.error.set("We couldn't remove that item. Please try again.");
          return of(null);
        })
      )
      .subscribe((cart) => {
        if (cart) this.cart.set(cart);
        this.loading.set(false);
      });
  }

  private readStoredCartId(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(STORAGE_KEY);
  }

  private storeCartId(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(STORAGE_KEY, id);
  }

  private clearStoredCartId(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(STORAGE_KEY);
  }
}
