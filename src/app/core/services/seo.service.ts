import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';

export interface SeoConfig {
  title: string;
  description: string;
  /** Path beginning with "/", e.g. "/shop/chocolate-chip-cookie" */
  path?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
}

const SITE_NAME = "K'sserts Cookie Café";

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  update(config: SeoConfig): void {
    const fullTitle = config.title.includes(SITE_NAME) ? config.title : `${config.title} | ${SITE_NAME}`;
    const url = `${environment.siteUrl}${config.path ?? ''}`;

    this.titleService.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:type', content: config.type ?? 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:url', content: url });
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
    }
    this.setCanonical(url);
  }

  setJsonLd(id: string, data: unknown): void {
    this.removeJsonLd(id);
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.text = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }

  removeJsonLd(id: string): void {
    this.doc.getElementById(id)?.remove();
  }

  private setCanonical(url: string): void {
    let link: HTMLLinkElement | null = this.doc.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
