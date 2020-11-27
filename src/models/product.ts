export interface Product {
  id: string;
  name: string;
  unitsOfMeasure: string;
  quantity?: number;
  price: number;
  totalPrice?: number;
}
