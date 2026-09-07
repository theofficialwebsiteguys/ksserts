import { Money, ProductImage, SelectedOption } from './product.model';

export interface CartAttribute {
  key: string;
  value: string;
}

export interface CartLineMerchandise {
  id: string;
  title: string;
  product: {
    handle: string;
    title: string;
  };
  image?: ProductImage | null;
  price: Money;
  selectedOptions: SelectedOption[];
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: CartLineMerchandise;
  cost: {
    totalAmount: Money;
  };
  /** Custom key/value pairs attached at add-to-cart time (e.g. build-a-box grouping). */
  attributes?: CartAttribute[];
}

/** One line to add to the cart. `attributes` round-trip to Shopify's real cart line attributes. */
export interface CartLineInput {
  variantId: string;
  quantity: number;
  attributes?: CartAttribute[];
}

export interface CartCost {
  subtotalAmount: Money;
  totalAmount: Money;
  totalTaxAmount?: Money | null;
}

export interface CartDiscountCode {
  code: string;
  applicable: boolean;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
  cost: CartCost;
  discountCodes?: CartDiscountCode[];
}
