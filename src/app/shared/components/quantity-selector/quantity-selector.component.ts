import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  template: `
    <div class="qty" role="group" [attr.aria-label]="'Quantity for ' + label()">
      <button
        type="button"
        class="qty__btn"
        (click)="decrease()"
        [disabled]="disabled() || value() <= min()"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span class="qty__value" aria-live="polite">{{ value() }}</span>
      <button
        type="button"
        class="qty__btn"
        (click)="increase()"
        [disabled]="disabled() || value() >= max()"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  `,
  styleUrl: './quantity-selector.component.scss'
})
export class QuantitySelectorComponent {
  value = input(1);
  min = input(1);
  max = input(20);
  disabled = input(false);
  label = input('item');
  valueChange = output<number>();

  increase(): void {
    if (this.value() < this.max()) this.valueChange.emit(this.value() + 1);
  }

  decrease(): void {
    if (this.value() > this.min()) this.valueChange.emit(this.value() - 1);
  }
}
