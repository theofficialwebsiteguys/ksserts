import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, concatMap, from, last, of, shareReplay, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Cart, CartLineInput } from '../models/cart.model';

const STORAGE_KEY = 'ksserts_cart_id';
const BUNDLE_STORAGE_KEY = 'ksserts_cart_bundles';

export interface LineBundleInfo {
  bundleId: string;
  label: string;
}

/**
 * Owns the Shopify cart lifecycle via the central commerce API.
 *   POST   /api/v1/{storeKey}/cart                         { lines: [{variantId,quantity,attributes?}] } -> Cart
 *   GET    /api/v1/{storeKey}/cart/{cartId}                                                              -> Cart
 *   POST   /api/v1/{storeKey}/cart/{cartId}/lines           { variantId, quantity, attributes? }         -> Cart
 *   PATCH  /api/v1/{storeKey}/cart/{cartId}/lines/{lineId}  { quantity }                                 -> Cart
 *   DELETE /api/v1/{storeKey}/cart/{cartId}/lines/{lineId}                                                -> Cart
 *
 * Confirmed directly against the live central API (2026-09-08): `POST /cart`
 * (creating a cart) accepts an array of lines in one call, but `POST
 * /cart/{cartId}/lines` (adding to an existing one) does NOT — it only takes
 * one `{ variantId, quantity }` object per request and 400s on an array body.
 * `addLines()` below adds multiple distinct variants (e.g. every cookie in a
 * box) as sequential single-line requests instead of one atomic call — ask
 * whoever owns the shopify-api repo to add array support to `/lines` if this
 * ever needs to be a single request again, but don't assume it's there.
 *
 * Also confirmed live: both endpoints silently accept and DROP a line's
 * `attributes` — they never come back on the `Cart` the API returns, even
 * though sending them doesn't error. Grouping (e.g. "which lines are one
 * box") can't rely on reading `CartLine.attributes` back from the API right
 * now — see `bundleByLineId` below for the client-side workaround, and
 * switch back to reading `attributes` once the backend actually persists
 * them.
 *
 * `loading`/`error` are global (the cart drawer's own skeleton/banner legitimately
 * want "is anything happening"), but every mutating method also returns an
 * `Observable<Cart | null>` for the specific request it made — callers that need
 * to know when *their own* action finished (a quick-add button, a cart line's own
 * quantity stepper) should subscribe to that instead of reading the shared
 * `loading` signal, or every such control across the page reacts to every add.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly base = `${environment.commerceApiUrl}/api/v1/${environment.storeKey}/cart`;

  readonly cart = signal<Cart | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isOpen = signal(false);

  /**
   * Client-side memory of which cart line ids were added together as one
   * box, keyed by line id — works around the central API not persisting
   * `CartLine.attributes` (see the class doc above). Survives reloads via
   * localStorage, same as the cart id itself. Entries for lines that no
   * longer exist in the cart are harmless dead weight, not cleaned up
   * automatically — line ids are cart-scoped and don't get reused.
   */
  readonly bundleByLineId = signal<Record<string, LineBundleInfo>>(this.readStoredBundles());

  readonly totalQuantity = computed(() => this.cart()?.totalQuantity ?? 0);

  constructor() {
    const existingId = this.readStoredCartId();
    if (existingId) {
      this.loading.set(true);
      this.http
        .get<Cart>(`${this.base}/${encodeURIComponent(existingId)}`)
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

  addLine(variantId: string, quantity = 1): Observable<Cart | null> {
    return this.addLines([{ variantId, quantity }]);
  }

  /**
   * Adds one or more distinct variants — used by the box builder to add
   * every cookie in a box, each carrying its own `attributes` (e.g. a
   * shared "Box of 6" / bundle-id pair). NOT one atomic request: the real
   * `/lines` endpoint only accepts a single line per call (see class doc),
   * so lines after the first are added one at a time via `concatMap`. The
   * `_bundle_id`/`Box` attributes are still sent (harmless, forward-
   * compatible if the backend ever starts persisting them) but grouping
   * for display relies on `bundleByLineId`, recorded from each response.
   */
  addLines(lines: CartLineInput[]): Observable<Cart | null> {
    if (lines.length === 0) return of(null);

    const request$ = from(lines).pipe(
      concatMap((line) => {
        const cartId = this.cart()?.id ?? this.readStoredCartId();
        const body = { variantId: line.variantId, quantity: line.quantity, attributes: line.attributes };
        const single$ = cartId
          ? this.http.post<Cart>(`${this.base}/${encodeURIComponent(cartId)}/lines`, body)
          : this.http.post<Cart>(this.base, { lines: [body] });

        return single$.pipe(
          tap((cart) => {
            this.storeCartId(cart.id);
            this.cart.set(cart);
            this.recordBundleTag(cart, line);
          })
        );
      }),
      last()
    );

    return this.run(request$, () => "We couldn't add that item to your cart. Please try again.", () => this.isOpen.set(true));
  }

  updateLineQuantity(lineId: string, quantity: number): Observable<Cart | null> {
    const cartId = this.cart()?.id;
    if (!cartId) return of(null);
    const request$ = this.http.patch<Cart>(`${this.base}/${encodeURIComponent(cartId)}/lines/${encodeURIComponent(lineId)}`, { quantity });
    return this.run(request$, () => "We couldn't update that item. Please try again.");
  }

  removeLine(lineId: string): Observable<Cart | null> {
    const cartId = this.cart()?.id;
    if (!cartId) return of(null);
    const request$ = this.http.delete<Cart>(`${this.base}/${encodeURIComponent(cartId)}/lines/${encodeURIComponent(lineId)}`);
    return this.run(request$, () => "We couldn't remove that item. Please try again.");
  }

  /**
   * Shared plumbing for every mutating call: flips the global `loading`/`error`
   * signals (for anything that legitimately wants "is something happening"),
   * always updates `cart` on success, and hands back a replayable observable so
   * a caller that needs to know when *this specific* request settled can
   * subscribe to it directly instead of racing the shared `loading` signal.
   */
  private run(request$: Observable<Cart>, errorMessage: () => string, onSuccess?: (cart: Cart) => void): Observable<Cart | null> {
    this.error.set(null);
    this.loading.set(true);

    const shared$ = request$.pipe(
      catchError(() => {
        this.error.set(errorMessage());
        return of(null);
      }),
      tap((cart) => {
        if (cart) {
          onSuccess?.(cart);
          this.cart.set(cart);
        }
        this.loading.set(false);
      }),
      shareReplay(1)
    );

    shared$.subscribe();
    return shared$;
  }

  /** Removes the local bundle tag for a line — call after a line is actually deleted from the cart, so stale entries don't linger unnecessarily. */
  forgetBundle(lineId: string): void {
    if (!(lineId in this.bundleByLineId())) return;
    this.bundleByLineId.update((current) => {
      const next = { ...current };
      delete next[lineId];
      return next;
    });
    this.storeBundles(this.bundleByLineId());
  }

  private recordBundleTag(cart: Cart, input: CartLineInput): void {
    const bundleId = input.attributes?.find((attr) => attr.key === '_bundle_id')?.value;
    if (!bundleId) return;
    const label = input.attributes?.find((attr) => attr.key === 'Box')?.value ?? 'Box';
    const resultLine = cart.lines.find((line) => line.merchandise.id === input.variantId);
    if (!resultLine) return;

    this.bundleByLineId.update((current) => {
      const next = { ...current, [resultLine.id]: { bundleId, label } };
      this.storeBundles(next);
      return next;
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

  private readStoredBundles(): Record<string, LineBundleInfo> {
    if (!isPlatformBrowser(this.platformId)) return {};
    try {
      return JSON.parse(localStorage.getItem(BUNDLE_STORAGE_KEY) ?? '{}');
    } catch {
      return {};
    }
  }

  private storeBundles(bundles: Record<string, LineBundleInfo>): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(BUNDLE_STORAGE_KEY, JSON.stringify(bundles));
  }
}
