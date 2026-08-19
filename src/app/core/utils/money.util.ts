import { Money, PriceRange } from '../models/product.model';

export function formatMoney(money: Money | null | undefined): string {
  if (!money) return '';
  const amount = parseFloat(money.amount);
  if (Number.isNaN(amount)) return '';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: money.currencyCode
    }).format(amount);
  } catch {
    return `${money.amount} ${money.currencyCode}`;
  }
}

export function formatPriceRange(range: PriceRange | null | undefined): string {
  if (!range) return '';
  const min = formatMoney(range.minVariantPrice);
  const max = formatMoney(range.maxVariantPrice);
  if (!min) return max;
  if (!max || range.minVariantPrice.amount === range.maxVariantPrice.amount) return min;
  return `${min} – ${max}`;
}

export function isOnSale(price: Money, compareAtPrice?: Money | null): boolean {
  if (!compareAtPrice) return false;
  return parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
}
