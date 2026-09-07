import { Environment } from '../app/core/models/environment.model';

// TODO: replace commerceApiUrl and siteUrl with real production values before launch.
export const environment: Environment = {
  production: true,
  commerceApiUrl: 'https://shopify-api-74fe224aea27.herokuapp.com',
  storeKey: 'ksserts',
  siteUrl: 'https://ksserts.com',
  goFundMeUrl: '',
  contactEmail: '',
  social: {
    instagramUrl: 'https://instagram.com/ksserts',
    facebookUrl: 'https://www.facebook.com/share/17pFzd7xhX/?mibextid=wwXIfr'
  },
  // TODO: confirm this matches the real Shopify collection handle once it's created.
  boxBuilder: {
    collectionHandle: 'build-your-own-box',
    sizes: [4, 6, 12]
  }
};
