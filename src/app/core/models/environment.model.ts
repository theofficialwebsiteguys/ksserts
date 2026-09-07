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
  /**
   * "Build Your Own Box" config. Eligibility is driven entirely by Shopify —
   * `collectionHandle` should point to a real collection containing every
   * product customers can pick for a box; add/remove products there in
   * Shopify admin, no code or API change needed. `sizes` are the box
   * quantities offered (cookie count per box). Requires every product in
   * that collection to be priced the same per unit — the box's displayed
   * total is just the sum of the real chosen variant prices, so a flat
   * "any Box of 6 costs the same" total only holds if the eligible
   * products' prices actually are uniform in Shopify.
   */
  boxBuilder: {
    collectionHandle: string;
    sizes: number[];
  };
}
