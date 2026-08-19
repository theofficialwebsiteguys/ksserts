import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { CommerceApiService } from '../../../../core/api/commerce-api.service';
import { ProductImage } from '../../../../core/models/product.model';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-home-gofundme',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './gofundme.component.html',
  styleUrl: './gofundme.component.scss'
})
export class GoFundMeComponent implements OnInit {
  private readonly commerceApi = inject(CommerceApiService);

  protected readonly goFundMeUrl = environment.goFundMeUrl;
  protected backdropImage = signal<ProductImage | null>(null);

  ngOnInit(): void {
    // this.commerceApi
    //   .getShowcaseImages(1, 11)
    //   .pipe(catchError(() => of([])))
    //   .subscribe((images) => this.backdropImage.set(images[2] ?? null));
  }
}
