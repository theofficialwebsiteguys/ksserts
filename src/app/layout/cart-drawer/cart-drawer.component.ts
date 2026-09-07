import { Component, ElementRef, HostListener, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { concatMap, from } from 'rxjs';

import { CartService } from '../../core/services/cart.service';
import { CartLine } from '../../core/models/cart.model';
import { Money } from '../../core/models/product.model';
import { formatMoney } from '../../core/utils/money.util';
import { QuantitySelectorComponent } from '../../shared/components/quantity-selector/quantity-selector.component';

interface SingleCartItem {
  kind: 'single';
  line: CartLine;
}

interface BoxCartGroup {
  kind: 'group';
  bundleId: string;
  label: string;
  lines: CartLine[];
}

type CartDisplayItem = SingleCartItem | BoxCartGroup;

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [RouterLink, QuantitySelectorComponent],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss'
})
export class CartDrawerComponent {
  protected readonly cartService = inject(CartService);
  protected readonly formatMoney = formatMoney;

  /**
   * Every cookie in a box is its own real cart line (own variant, own
   * price — see [[project-ksserts-box-builder]]), but they should read as
   * one box to the customer, not N unrelated lines. Grouping is keyed by a
   * bundle id, read from `line.attributes` if the central API ever starts
   * persisting those (it doesn't yet — see `CartService`'s class doc), and
   * otherwise from `CartService.bundleByLineId`, its client-side fallback.
   * Anything with neither renders as a normal, ungrouped line.
   */
  protected readonly displayItems = computed<CartDisplayItem[]>(() => {
    const lines = this.cartService.cart()?.lines ?? [];
    const bundleRegistry = this.cartService.bundleByLineId();
    const items: CartDisplayItem[] = [];
    const groupsByBundleId = new Map<string, BoxCartGroup>();

    for (const line of lines) {
      const fromAttrs = line.attributes?.find((attr) => attr.key === '_bundle_id')?.value;
      const bundle = fromAttrs
        ? { bundleId: fromAttrs, label: line.attributes?.find((attr) => attr.key === 'Box')?.value ?? 'Box' }
        : bundleRegistry[line.id];

      if (!bundle) {
        items.push({ kind: 'single', line });
        continue;
      }
      let group = groupsByBundleId.get(bundle.bundleId);
      if (!group) {
        group = { kind: 'group', bundleId: bundle.bundleId, label: bundle.label, lines: [] };
        groupsByBundleId.set(bundle.bundleId, group);
        items.push(group);
      }
      group.lines.push(line);
    }

    return items;
  });

  @ViewChild('closeBtn') closeBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('drawerPanel') drawerPanel?: ElementRef<HTMLElement>;

  private lastFocused: HTMLElement | null = null;

  /** Line ids with an update/remove in flight — scoped per line, not `cartService.loading()`, so editing one line doesn't disable every other line's controls. */
  private readonly busyLineIds = signal<ReadonlySet<string>>(new Set());

  constructor() {
    effect(() => {
      const isOpen = this.cartService.isOpen();
      if (isOpen) {
        this.lastFocused = document.activeElement as HTMLElement | null;
        document.body.classList.add('no-scroll');
        queueMicrotask(() => this.closeBtn?.nativeElement.focus());
      } else {
        document.body.classList.remove('no-scroll');
        this.lastFocused?.focus?.();
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.cartService.isOpen()) this.close();
  }

  @HostListener('document:keydown.tab', ['$event'])
  onTab(event: KeyboardEvent): void {
    if (!this.cartService.isOpen() || !this.drawerPanel) return;
    const focusable = this.drawerPanel.nativeElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  close(): void {
    this.cartService.close();
  }

  trackDisplayItem(_index: number, item: CartDisplayItem): string {
    return item.kind === 'single' ? item.line.id : item.bundleId;
  }

  /** Underscore-prefixed keys (e.g. `_bundle_id`) are internal grouping metadata, not shown to the customer. */
  visibleAttributes(line: CartLine): CartLine['attributes'] {
    return line.attributes?.filter((attr) => !attr.key.startsWith('_'));
  }

  isBusy(lineId: string): boolean {
    return this.busyLineIds().has(lineId);
  }

  isGroupBusy(group: BoxCartGroup): boolean {
    return group.lines.some((line) => this.isBusy(line.id));
  }

  groupTotal(group: BoxCartGroup): Money {
    const amount = group.lines.reduce((sum, line) => sum + parseFloat(line.cost.totalAmount.amount), 0);
    return { amount: amount.toFixed(2), currencyCode: group.lines[0]?.cost.totalAmount.currencyCode ?? 'USD' };
  }

  onQuantityChange(line: CartLine, quantity: number): void {
    const request$ = quantity <= 0 ? this.cartService.removeLine(line.id) : this.cartService.updateLineQuantity(line.id, quantity);
    this.runForLine(line.id, request$);
  }

  removeLine(line: CartLine): void {
    this.runForLine(line.id, this.cartService.removeLine(line.id));
  }

  /** Removes every line in the box together — a box is one custom item, not something to partially edit in the cart. */
  removeGroup(group: BoxCartGroup): void {
    if (this.isGroupBusy(group)) return;
    const ids = group.lines.map((line) => line.id);
    for (const id of ids) this.setBusy(id, true);
    from(ids)
      .pipe(concatMap((id) => this.cartService.removeLine(id)))
      .subscribe({
        complete: () => {
          for (const id of ids) {
            this.setBusy(id, false);
            this.cartService.forgetBundle(id);
          }
        }
      });
  }

  private runForLine(lineId: string, request$: ReturnType<CartService['removeLine']>): void {
    this.setBusy(lineId, true);
    request$.subscribe(() => this.setBusy(lineId, false));
  }

  private setBusy(lineId: string, busy: boolean): void {
    this.busyLineIds.update((current) => {
      const next = new Set(current);
      if (busy) next.add(lineId);
      else next.delete(lineId);
      return next;
    });
  }
}
