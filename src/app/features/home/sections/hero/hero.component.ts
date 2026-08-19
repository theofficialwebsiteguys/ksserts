import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { CommerceApiService } from '../../../../core/api/commerce-api.service';
import { ProductImage } from '../../../../core/models/product.model';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit {
  private readonly commerceApi = inject(CommerceApiService);

  protected marqueeImages = signal<ProductImage[]>([]);

  ngOnInit(): void {
    this.commerceApi
      .getShowcaseImages(14)
      .pipe(catchError(() => of([])))
      .subscribe((images) => this.marqueeImages.set(images));
  }
}
