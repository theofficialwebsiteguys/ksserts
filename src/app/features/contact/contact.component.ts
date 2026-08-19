import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { ContactService } from '../../core/services/contact.service';
import { SeoService } from '../../core/services/seo.service';
import { CONTACT_REASONS, ContactReason } from '../../core/models/contact.model';
import { CutoutRevealDirective } from '../../shared/directives/cutout-reveal.directive';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CutoutRevealDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly seo = inject(SeoService);

  protected readonly reasons = CONTACT_REASONS;
  protected readonly contactEmail = environment.contactEmail;
  protected status = signal<SubmitStatus>('idle');

  protected form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    reason: ['' as ContactReason | '', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor() {
    this.seo.update({
      title: 'Contact',
      description: "Get in touch with K'sserts Cookie Café for custom orders, catering, café updates, or wholesale collaboration.",
      path: '/contact'
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status.set('submitting');
    const { name, email, phone, reason, message } = this.form.getRawValue();

    this.contactService
      .submit({ name, email, phone: phone || undefined, reason: reason as ContactReason, message })
      .subscribe({
        next: () => {
          this.status.set('success');
          this.form.reset();
        },
        error: () => {
          this.status.set('error');
        }
      });
  }
}
