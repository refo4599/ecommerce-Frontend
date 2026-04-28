export interface Product {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  isActive: boolean;
  category?: {
    id: number;
    name: string;
    nameAr: string;
    imageUrl?: string;
  };
}

export interface BranchProduct {
  id: number;
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
