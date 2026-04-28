import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { Cart, CartItem } from '../../../core/models/cart.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  placingOrder = false;
  orderSuccess = false;
  showToast = false;

  constructor(
    private cartService: CartService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.http.get<{ success: boolean, data: any[] }>
      (`${environment.apiUrl}/branches`).subscribe(res => {
      const branches = res.data;
      const defaultBranch = branches.find((b: any) => b.isDefault) ?? branches[0];
      if (!defaultBranch) { this.loading = false; return; }

      this.cartService.getCart(defaultBranch.id).subscribe({
        next: res => {
          this.cart = res.data;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    });
  }

  get totalQuantity(): number {
    if (!this.cart) return 0;
    return this.cart.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  get cartTotal(): number {
    if (!this.cart) return 0;
    return this.cart.total;
  }

  get cartItems(): CartItem[] {
    if (!this.cart) return [];
    return this.cart.items;
  }

  get cartBranchName(): string {
    return this.cart?.branchName ?? '';
  }

  get hasItems(): boolean {
    return (this.cart?.items?.length ?? 0) > 0;
  }

  updateQuantity(item: CartItem, change: number) {
    const newQty = item.quantity + change;
    if (newQty <= 0) {
      this.removeItem(item);
      return;
    }
    this.cartService.updateItem(item.id, newQty).subscribe(res => {
      this.cart = res.data;
    });
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item.id).subscribe(() => {
      if (this.cart) {
        this.cart.items = this.cart.items.filter(i => i.id !== item.id);
        this.cart.total = this.cart.items.reduce((sum, i) => sum + i.subtotal, 0);
      }
    });
  }

  placeOrder() {
    if (!this.cart || this.cart.items.length === 0) return;
    this.placingOrder = true;

    this.http.post<{ success: boolean, data: any }>
      (`${environment.apiUrl}/orders`, { branchId: this.cart.branchId })
      .subscribe({
        next: () => {
          this.placingOrder = false;
          this.showToast = true;
          setTimeout(() => {
            this.showToast = false;
            this.router.navigate(['/home']);
          }, 3000);
        },
        error: () => { this.placingOrder = false; }
      });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
