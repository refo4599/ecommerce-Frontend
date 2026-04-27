export interface Product {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  categoryName: string;
}
export interface BranchProduct {
  productId: number;
  name: string;
  nameAr: string;
  description?: string;
  effectivePrice: number;
  imageUrl?: string;
  isAvailable: boolean;
  stock: number;
  category?: {
    id: number;
    name: string;
    nameAr: string;
    imageUrl?: string;
  };
}
