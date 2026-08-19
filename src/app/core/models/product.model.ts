export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText: string | null;
  width?: number | null;
  height?: number | null;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  price: Money;
  compareAtPrice?: Money | null;
  selectedOptions: SelectedOption[];
  image?: ProductImage | null;
  sku?: string | null;
}

export interface ProductMetafield {
  namespace?: string;
  key: string;
  value: string;
  type?: string;
}

export interface PriceRange {
  minVariantPrice: Money;
  maxVariantPrice: Money;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string | null;
  availableForSale: boolean;
  tags: string[];
  productType?: string | null;
  vendor?: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  options: ProductOption[];
  priceRange: PriceRange;
  compareAtPriceRange?: PriceRange | null;
  metafields?: ProductMetafield[];
  /** Handles of the collections this product belongs to, used for shop filtering. */
  collections?: string[];
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor?: string | null;
  startCursor?: string | null;
}

export interface ProductListResponse {
  products: Product[];
  pageInfo?: PageInfo;
}

export interface ProductQueryParams {
  collection?: string;
  search?: string;
  limit?: number;
  cursor?: string;
  availableOnly?: boolean;
}
