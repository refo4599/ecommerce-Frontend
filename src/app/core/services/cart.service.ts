import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cart } from '../models/cart.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private url = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) {}

  // GET /api/cart/{branchId}
  getCart(branchId: number) {
    return this.http.get<{ success: boolean, data: Cart }>(
      `${this.url}/${branchId}`
    );
  }

  // POST /api/cart/items
  addItem(branchId: number, productId: number, quantity: number) {
    return this.http.post<{ success: boolean, data: Cart }>(
      `${this.url}/items`,
      { branchId, productId, quantity }
    );
  }

  // PUT /api/cart/items/{cartItemId}
  updateItem(cartItemId: number, quantity: number) {
    return this.http.put<{ success: boolean, data: Cart }>(
      `${this.url}/items/${cartItemId}`,
      { quantity }
    );
  }

  // DELETE /api/cart/items/{cartItemId}
  removeItem(cartItemId: number) {
    return this.http.delete<{ success: boolean }>(
      `${this.url}/items/${cartItemId}`
    );
  }

  // DELETE /api/cart/{branchId}/clear
  clear(branchId: number) {
    return this.http.delete<{ success: boolean }>(
      `${this.url}/${branchId}/clear`
    );
  }

  // POST /api/cart/switch-branch
  switchBranch(newBranchId: number) {
    return this.http.post<{ success: boolean, data: Cart, removedItems: string[] }>(
      `${this.url}/switch-branch`,
      { newBranchId }
    );
  }
}
