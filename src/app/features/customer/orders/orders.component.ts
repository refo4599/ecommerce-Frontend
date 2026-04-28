import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getMyOrders().subscribe({
      next: res => {
        this.orders = res.data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'حصل خطأ في تحميل الطلبات';
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'قيد الانتظار',
      'Confirmed': 'تم التأكيد',
      'Preparing': 'جاري التحضير',
      'Ready': 'جاهز',
      'Delivered': 'تم التسليم',
      'Cancelled': 'ملغي'
    };
    return map[status] ?? status;
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'bg-yellow-50 text-yellow-600 border-yellow-200',
      'Confirmed': 'bg-blue-50 text-blue-600 border-blue-200',
      'Preparing': 'bg-orange-50 text-orange-600 border-orange-200',
      'Ready': 'bg-green-50 text-green-600 border-green-200',
      'Delivered': 'bg-gray-50 text-gray-600 border-gray-200',
      'Cancelled': 'bg-red-50 text-red-500 border-red-200'
    };
    return map[status] ?? 'bg-gray-50 text-gray-600 border-gray-200';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
