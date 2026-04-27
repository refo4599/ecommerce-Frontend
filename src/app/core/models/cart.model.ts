export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  branchId: number;
  branchName: string;
  items: CartItem[];
  total: number;
}
