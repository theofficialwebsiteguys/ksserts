import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div class="error-state" role="alert">
      <p class="error-state__title">{{ title() }}</p>
      <p class="error-state__message">{{ message() }}</p>
      @if (showRetry()) {
        <button type="button" class="btn btn--outline-dark btn--sm" (click)="retry.emit()">Try again</button>
      }
    </div>
  `,
  styleUrl: './error-state.component.scss'
})
export class ErrorStateComponent {
  title = input('Something went wrong');
  message = input("We couldn't load this right now. Please try again in a moment.");
  showRetry = input(true);
  retry = output<void>();
}
