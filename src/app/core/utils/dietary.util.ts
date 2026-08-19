import { Product, ProductMetafield } from '../models/product.model';

export type DietaryTagKey =
  | 'gluten-free'
  | 'vegan'
  | 'sugar-conscious'
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
 * underlying tag or metafield value actually matches.
 */
const DIETARY_TAG_MAP: { key: DietaryTagKey; label: string; matches: RegExp }[] = [
  { key: 'gluten-free', label: 'Gluten Free', matches: /^(gluten[\s-]?free|gf)$/i },
  { key: 'vegan', label: 'Vegan', matches: /^vegan$/i },
  {
    key: 'sugar-conscious',
    label: 'Sugar Conscious',
    matches: /^(sugar[\s-]?conscious|sugar[\s-]?free|no[\s-]?sugar[\s-]?added|low[\s-]?sugar)$/i
  },
  { key: 'dairy-free', label: 'Dairy Free', matches: /^dairy[\s-]?free$/i },
  { key: 'nut-free', label: 'Nut Free', matches: /^nut[\s-]?free$/i },
  { key: 'almond-flour', label: 'Almond Flour', matches: /^almond[\s-]?flour$/i }
];

function isDietaryMetafield(field: ProductMetafield): boolean {
  return /diet|allerg|attribute/i.test(field.key) || /diet|allerg|attribute/i.test(field.namespace ?? '');
}

export function getDietaryBadges(product: Pick<Product, 'tags' | 'metafields'>): DietaryBadge[] {
  const candidates = [
    ...(product.tags ?? []),
    ...(product.metafields ?? [])
      .filter(isDietaryMetafield)
      .flatMap((field) => field.value.split(','))
  ];

  const found = new Map<DietaryTagKey, DietaryBadge>();
  for (const raw of candidates) {
    const value = raw.trim();
    if (!value) continue;
    for (const entry of DIETARY_TAG_MAP) {
      if (entry.matches.test(value)) {
        found.set(entry.key, { key: entry.key, label: entry.label });
      }
    }
  }
  return Array.from(found.values());
}

export function hasDietaryTag(product: Pick<Product, 'tags' | 'metafields'>, key: DietaryTagKey): boolean {
  return getDietaryBadges(product).some((badge) => badge.key === key);
}

/** Builds the set of dietary filter chips actually represented in a product list. */
export function getAvailableDietaryFilters(products: Pick<Product, 'tags' | 'metafields'>[]): DietaryBadge[] {
  const found = new Map<DietaryTagKey, DietaryBadge>();
  for (const product of products) {
    for (const badge of getDietaryBadges(product)) {
      found.set(badge.key, badge);
    }
  }
  return Array.from(found.values());
}
