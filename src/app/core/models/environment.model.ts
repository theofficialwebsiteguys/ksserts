export interface Environment {
  production: boolean;
  /** Base URL of the reusable central Shopify commerce API, e.g. https://commerce-api.example.com/api/v1 */
  commerceApiUrl: string;
  /** Identifies this storefront to the central API. All commerce endpoints are scoped under /{storeKey}. */
  storeKey: string;
  /** Public site origin, used for canonical links and Open Graph URLs. */
  siteUrl: string;
  /**
   * GoFundMe campaign URL for the Cookie Café fundraiser.
   * Leave empty until a real campaign exists — the homepage section renders
   * as an informational placeholder (no link) whenever this is blank.
   */
  goFundMeUrl: string;
  /**
   * Optional direct contact email shown as a fallback on the Contact page.
   * Leave empty until confirmed — no email is invented.
   */
  contactEmail: string;
  social: {
    instagramUrl: string;
    facebookUrl: string;
  };
}
