import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ContactFormPayload } from '../models/contact.model';

/**
 * Submits the contact form to the central API.
 * Assumed contract: POST /{storeKey}/contact  ->  204 No Content
 * This route may not be wired up on the backend yet — the Contact page
 * surfaces a real error in that case rather than pretending to succeed.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.commerceApiUrl}/${environment.storeKey}/contact`;

  submit(payload: ContactFormPayload): Observable<void> {
    return this.http.post<void>(this.base, payload);
  }
}
