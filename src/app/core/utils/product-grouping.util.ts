import { Product } from '../models/product.model';

export type DietVariantType = 'regular' | 'gluten-free' | 'vegan';

const DIET_ORDER: DietVariantType[] = ['regular', 'gluten-free', 'vegan'];
const DIET_LABELS: Record<DietVariantType, string> = {
  regular: 'Regular',
  'gluten-free': 'Gluten-Free',
  vegan: 'Vegan'
};

/** Real tag/collection values ("Vegan", "gluten-free-cookies") decide diet — never the title. */
export function getDietVariantType(product: Pick<Product, 'tags' | 'collections'>): DietVariantType {
  const tags = product.tags ?? [];
  const collections = product.collections ?? [];
  const isGlutenFree =
    tags.some((tag) => /^gluten[\s-]?free$/i.test(tag.trim())) || collections.some((c) => /gluten[\s-]?free/i.test(c));
  const isVegan = tags.some((tag) => /^vegan$/i.test(tag.trim())) || collections.some((c) => /vegan/i.test(c));
  if (isGlutenFree) return 'gluten-free';
  if (isVegan) return 'vegan';
  return 'regular';
}

export function getDietLabel(product: Pick<Product, 'tags' | 'collections'>): string {
  return DIET_LABELS[getDietVariantType(product)];
}

export function sortByDiet(products: Product[]): Product[] {
  return [...products].sort((a, b) => DIET_ORDER.indexOf(getDietVariantType(a)) - DIET_ORDER.indexOf(getDietVariantType(b)));
}

/**
 * Real product titles carry the diet as a leading modifier ("Gluten-Free Chocolate
 * Chip", "Vegan Chocolate Chip") rather than as a Shopify variant option — so the
 * only way to find that these are the same flavor is to strip the modifier and
 * compare what's left.
 */
const LEADING_MODIFIERS = [/^organic\s+/i, /^vegan\s+/i, /^gluten[\s-]?free\s+/i];

export function getGroupBaseTitle(title: string): string {
  let base = title.trim();
  let strippedSomething = true;
  while (strippedSomething) {
    strippedSomething = false;
    for (const pattern of LEADING_MODIFIERS) {
      if (pattern.test(base)) {
        base = base.replace(pattern, '').trim();
        strippedSomething = true;
      }
    }
  }
  return base || title.trim();
}

/**
 * The live catalog isn't perfectly consistent about naming the same flavor
 * across diet variants — e.g. the vegan version is titled "Chocolate Chip
 * Oreo" but the gluten-free version is "Chocolate Oreo", confirmed by the
 * client to be the same cookie. Rather than fuzzy-matching titles (risky —
 * that could just as easily merge genuinely different flavors, like
 * "Chocolate Chip" and "Chocolate Chip Walnut"), known mismatches are
 * listed here explicitly. Add an entry whenever the client reports another
 * same-flavor pair that doesn't share an exact base title; the value is the
 * canonical display title for the merged group.
 */
const BASE_TITLE_OVERRIDES: Record<string, string> = {
  'chocolate oreo': 'Chocolate Chip Oreo',
  'chocolate chip oreo': 'Chocolate Chip Oreo'
};

/** The display/grouping name for a flavor — `getGroupBaseTitle()` plus the overrides above. */
export function getGroupDisplayTitle(title: string): string {
  const stripped = getGroupBaseTitle(title);
  return BASE_TITLE_OVERRIDES[stripped.toLowerCase()] ?? stripped;
}

export function getGroupKey(product: Pick<Product, 'title'>): string {
  return getGroupDisplayTitle(product.title).toLowerCase();
}

export interface GroupedProduct extends Product {
  /** The real, individually-purchasable products this card/page represents. Length 1 for a flavor with only one diet variant. */
  members: Product[];
}

/**
 * Collapses same-flavor diet variants (regular/gluten-free/vegan) that exist as
 * separate real products into one card/page, so "Chocolate Chip" shows once with
 * its diet options inside instead of once per variant. A flavor with only one
 * diet variant passes through unchanged.
 */
export function groupProducts(products: Product[]): GroupedProduct[] {
  const order: string[] = [];
  const byKey = new Map<string, Product[]>();
  for (const product of products) {
    const key = getGroupKey(product);
    if (!byKey.has(key)) {
      byKey.set(key, []);
      order.push(key);
    }
    byKey.get(key)!.push(product);
  }
  return order.map((key) => buildGroupedProduct(byKey.get(key)!));
}

function buildGroupedProduct(rawMembers: Product[]): GroupedProduct {
  if (rawMembers.length === 1) {
    return { ...rawMembers[0], members: rawMembers };
  }

  const members = sortByDiet(rawMembers);
  const primary = members[0];
  const baseTitle = getGroupDisplayTitle(primary.title);
  const currencyCode = primary.priceRange.minVariantPrice.currencyCode;
  const minPrice = Math.min(...members.map((m) => parseFloat(m.priceRange.minVariantPrice.amount)));
  const maxPrice = Math.max(...members.map((m) => parseFloat(m.priceRange.maxVariantPrice.amount)));

  return {
    ...primary,
    id: `group:${baseTitle.toLowerCase()}`,
    title: baseTitle,
    tags: Array.from(new Set(members.flatMap((m) => m.tags))),
    collections: Array.from(new Set(members.flatMap((m) => m.collections ?? []))),
    availableForSale: members.some((m) => m.availableForSale),
    variants: members.flatMap((m) => m.variants),
    priceRange: {
      minVariantPrice: { amount: minPrice.toFixed(2), currencyCode },
      maxVariantPrice: { amount: maxPrice.toFixed(2), currencyCode }
    },
    compareAtPriceRange: null,
    members
  };
}
