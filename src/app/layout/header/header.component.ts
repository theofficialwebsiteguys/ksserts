import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { CartService } from '../../core/services/cart.service';
import { LogoComponent } from '../../shared/components/logo/logo.component';

interface NavLink {
  label: string;
  path: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Home', path: '/' },
  { label: 'Our Story', path: '/our-story' },
  { label: 'Shop', path: '/shop' },
  { label: 'Contact', path: '/contact' }
];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  protected readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  protected readonly navLinks = NAV_LINKS;
  protected isScrolled = signal(false);
  protected mobileMenuOpen = signal(false);

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.closeMobileMenu();
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 24);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobileMenu();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
    document.body.classList.toggle('no-scroll', this.mobileMenuOpen());
  }

  closeMobileMenu(): void {
    if (!this.mobileMenuOpen()) return;
    this.mobileMenuOpen.set(false);
    document.body.classList.remove('no-scroll');
  }

  openCart(): void {
    this.closeMobileMenu();
    this.cartService.open();
  }
}
