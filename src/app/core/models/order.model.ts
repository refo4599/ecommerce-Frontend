export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  branchId: number;
  branchName: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}
