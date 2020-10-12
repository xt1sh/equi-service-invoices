import { Product } from './product';
export interface Info {
  provider: string;
  client: string;
  number: string;
  date: Date;
  discount: number;
  products: Product[];
}
