import { Component, ElementRef, HostListener, ViewChild, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../core/services/cart.service';
import { CartLine } from '../../core/models/cart.model';
import { formatMoney } from '../../core/utils/money.util';
import { QuantitySelectorComponent } from '../../shared/components/quantity-selector/quantity-selector.component';

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

  @ViewChild('closeBtn') closeBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('drawerPanel') drawerPanel?: ElementRef<HTMLElement>;

  private lastFocused: HTMLElement | null = null;

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

  trackLine(_index: number, line: CartLine): string {
    return line.id;
  }

  onQuantityChange(line: CartLine, quantity: number): void {
    if (quantity <= 0) {
      this.cartService.removeLine(line.id);
    } else {
      this.cartService.updateLineQuantity(line.id, quantity);
    }
  }
}
