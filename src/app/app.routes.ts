import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'our-story',
    loadComponent: () => import('./features/story/story.component').then((m) => m.StoryComponent)
  },
  {
    path: 'shop',
    loadComponent: () => import('./features/shop/shop.component').then((m) => m.ShopComponent)
  },
  {
    // Must come before 'shop/:handle' — otherwise that param route swallows this exact path first.
    path: 'shop/build-a-box',
    loadComponent: () => import('./features/box-builder/box-builder.component').then((m) => m.BoxBuilderComponent)
  },
  {
    path: 'shop/:handle',
    loadComponent: () => import('./features/product/product.component').then((m) => m.ProductComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then((m) => m.ContactComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
