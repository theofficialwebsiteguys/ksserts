import { Product, ProductMetafield } from '../models/product.model';

export type DietaryTagKey =
  | 'gluten-free'
  | 'vegan'
  | 'diabetic-friendly'
  | 'dairy-free'
  | 'nut-free'
  | 'almond-flour';

export interface DietaryBadge {
  key: DietaryTagKey;
  label: string;
}

/**
 * Maps real Shopify product tags / metafield values onto display badges.
 * Nothing here is invented per-product — a badge only appears when the
 * underlying tag or metafield value actually matches. "Diabetic Friendly"
 * also absorbs sugar-free/sugar-conscious tag values — the client's own
 * framing treats these as one claim with one badge, not two.
 */
const DIETARY_TAG_MAP: { key: DietaryTagKey; label: string; matches: RegExp }[] = [
  { key: 'gluten-free', label: 'Gluten Free', matches: /^(gluten[\s-]?free|gf)$/i },
  { key: 'vegan', label: 'Vegan', matches: /^vegan$/i },
  {
    key: 'diabetic-friendly',
    label: 'Diabetic Friendly',
    matches:
      /^(diabetic[\s-]?friendly|diabetes[\s-]?friendly|diabetic|sugar[\s-]?conscious|sugar[\s-]?free|no[\s-]?sugar[\s-]?added|low[\s-]?sugar)$/i
  },
  { key: 'dairy-free', label: 'Dairy Free', matches: /^dairy[\s-]?free$/i },
  { key: 'nut-free', label: 'Nut Free', matches: /^nut[\s-]?free$/i },
  { key: 'almond-flour', label: 'Almond Flour', matches: /^almond[\s-]?flour$/i }
];

/**
 * Every real product in the store today has empty tags and metafields —
 * dietary info actually lives in which collections a product belongs to
 * (handles like "gluten-free-cookies", "sugar-free-cookies"). Matched as a
 * substring rather than DIETARY_TAG_MAP's exact-value match, since handles
 * carry extra words the clean tag values above don't.
 */
const DIETARY_COLLECTION_MAP: { key: DietaryTagKey; label: string; matches: RegExp }[] = [
  { key: 'gluten-free', label: 'Gluten Free', matches: /gluten[\s-]?free/i },
  { key: 'vegan', label: 'Vegan', matches: /vegan/i },
  { key: 'diabetic-friendly', label: 'Diabetic Friendly', matches: /diabet|sugar[\s-]?free|sugar[\s-]?conscious/i },
  { key: 'dairy-free', label: 'Dairy Free', matches: /dairy[\s-]?free/i },
  { key: 'nut-free', label: 'Nut Free', matches: /nut[\s-]?free/i },
  { key: 'almond-flour', label: 'Almond Flour', matches: /almond[\s-]?flour/i }
];

/**
 * Real client-supplied badge art (public/assets/badges/) — only the keys
 * with actual artwork appear here. Every other dietary key still renders,
 * just as the plain text pill (see DietaryBadgesComponent).
 */
export const DIETARY_BADGE_ICONS: Partial<Record<DietaryTagKey, string>> = {
  'gluten-free': 'assets/badges/gluten-free.png',
  vegan: 'assets/badges/vegan.png',
  'diabetic-friendly': 'assets/badges/diabetic-friendly.png'
};

function isDietaryMetafield(field: ProductMetafield): boolean {
  return /diet|allerg|attribute/i.test(field.key) || /diet|allerg|attribute/i.test(field.namespace ?? '');
}

type DietaryProduct = Pick<Product, 'tags' | 'metafields' | 'collections'>;

export function getDietaryBadges(product: DietaryProduct): DietaryBadge[] {
  const tagCandidates = [
    ...(product.tags ?? []),
    ...(product.metafields ?? [])
      .filter(isDietaryMetafield)
      .flatMap((field) => field.value.split(','))
  ];

  const found = new Map<DietaryTagKey, DietaryBadge>();
  for (const raw of tagCandidates) {
    const value = raw.trim();
    if (!value) continue;
    for (const entry of DIETARY_TAG_MAP) {
      if (entry.matches.test(value)) {
        found.set(entry.key, { key: entry.key, label: entry.label });
      }
    }
  }

  for (const handle of product.collections ?? []) {
    for (const entry of DIETARY_COLLECTION_MAP) {
      if (entry.matches.test(handle)) {
        found.set(entry.key, { key: entry.key, label: entry.label });
      }
    }
  }

  return Array.from(found.values());
}

export function hasDietaryTag(product: DietaryProduct, key: DietaryTagKey): boolean {
  return getDietaryBadges(product).some((badge) => badge.key === key);
}

/** Builds the set of dietary filter chips actually represented in a product list. */
export function getAvailableDietaryFilters(products: DietaryProduct[]): DietaryBadge[] {
  const found = new Map<DietaryTagKey, DietaryBadge>();
  for (const product of products) {
    for (const badge of getDietaryBadges(product)) {
      found.set(badge.key, badge);
    }
  }
  return Array.from(found.values());
}
