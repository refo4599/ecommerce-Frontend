import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BranchProduct, Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private url = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<{success: boolean, data: Product[]}>(`${this.url}`);
  }

  getByBranch(branchId: number) {
    return this.http.get<{success: boolean, data: BranchProduct[]}>
      (`${this.url}/branch/${branchId}`);
  }

  create(data: Partial<Product>) {
    return this.http.post<{success: boolean, data: Product}>(`${this.url}`, data);
  }

  update(id: number, data: Partial<Product>) {
    return this.http.put<{success: boolean, data: Product}>(`${this.url}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<{success: boolean}>(`${this.url}/${id}`);
  }

  assignToBranch(branchId: number, productId: number, stock: number) {
    return this.http.post<{success: boolean}>
      (`${this.url}/branch/${branchId}/assign`, { productId, stock });
  }

  updateStock(branchId: number, productId: number, stock: number, priceOverride?: number) {
    return this.http.put<{success: boolean}>
      (`${this.url}/branch/${branchId}/stock`, { productId, stock, priceOverride });
  }
}
