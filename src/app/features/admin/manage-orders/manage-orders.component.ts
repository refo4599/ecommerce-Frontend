import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: number;
  branchId: number;
  branchName: string;
  totalAmount: number;
  status: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-orders.component.html'
})
export class ManageOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  selectedOrder: Order | null = null;
  page = 1;
  pageSize = 10;
  total = 0;

  statusLabels: { [key: string]: string | undefined } = {
    Pending: 'قيد الانتظار',
    Confirmed: 'تم التأكيد',
    Processing: 'جاري التجهيز',
    Completed: 'مكتمل',
    Cancelled: 'ملغي'
  };

  statusColors: { [key: string]: string | undefined } = {
    Pending: 'bg-amber-50 text-amber-700',
    Confirmed: 'bg-blue-50 text-blue-700',
    Processing: 'bg-purple-50 text-purple-700',
    Completed: 'bg-emerald-50 text-emerald-700',
    Cancelled: 'bg-red-50 text-red-500'
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.http.get<{success: boolean, data: {items: Order[], total: number}}>
      (`${environment.apiUrl}/orders?page=${this.page}&pageSize=${this.pageSize}`)
      .subscribe(res => {
        this.orders = res.data.items;
        this.total = res.data.total;
        this.loading = false;
      });
  }

  updateStatus(orderId: number, status: string) {
    this.http.put(`${environment.apiUrl}/orders/${orderId}/status`, { status })
      .subscribe(() => this.loadOrders());
  }

  viewOrder(order: Order) {
    this.selectedOrder = order;
  }

  closeDetails() {
    this.selectedOrder = null;
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

  getStatusColor(status: string): string {
    return this.statusColors[status] ?? 'bg-gray-100 text-gray-600';
  }

  get totalPages() {
    return Math.ceil(this.total / this.pageSize);
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadOrders();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadOrders();
    }
  }
}
