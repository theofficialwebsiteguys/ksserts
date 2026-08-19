import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';

import { CommerceApiService } from '../../../../core/api/commerce-api.service';
import { ProductImage } from '../../../../core/models/product.model';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

interface CafeAudience {
  label: string;
}

const AUDIENCES: CafeAudience[] = [
  { label: 'Coffee lovers' },
  { label: 'Families celebrating milestones' },
  { label: 'Friends reconnecting' },
  { label: 'Students studying' },
  { label: 'Neighbors gathering' }
];

@Component({
  selector: 'app-home-cookie-cafe',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './cookie-cafe.component.html',
  styleUrl: './cookie-cafe.component.scss'
})
export class CookieCafeComponent implements OnInit {
  private readonly commerceApi = inject(CommerceApiService);

  protected readonly audiences = AUDIENCES;
  protected visualImage = signal<ProductImage | null>(null);

  ngOnInit(): void {
    this.commerceApi
      .getShowcaseImages(1, 8)
      .pipe(catchError(() => of([])))
      .subscribe((images) => this.visualImage.set(images[0] ?? null));
  }
}
