import { Product } from './product';
export interface Info {
  provider: string;
  client: string;
  number: string;
  date: Date;
  discount: number;
  returnDiscount: number;
  products: Product[];
  returnProducts: Product[];
}
