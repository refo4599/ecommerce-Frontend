import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private url = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getMyOrders() {
    return this.http.get<{success: boolean, data: Order[]}>(`${this.url}/my`);
  }

  getAllOrders(page = 1, pageSize = 10) {
    return this.http.get<{success: boolean, data: Order[], total: number}>
      (`${this.url}?page=${page}&pageSize=${pageSize}`);
  }

  placeOrder(branchId: number) {
    return this.http.post<{success: boolean, data: Order}>
      (`${this.url}`, { branchId });
  }
}
