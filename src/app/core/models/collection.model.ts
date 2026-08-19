import { Product, ProductImage } from './product.model';

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  image?: ProductImage | null;
}

export interface CollectionWithProducts {
  collection: Collection;
  products: Product[];
}
