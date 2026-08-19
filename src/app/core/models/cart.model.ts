import { Money, ProductImage, SelectedOption } from './product.model';

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
