import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchService } from '../../../core/services/branch.service';
import { ProductService } from '../../../core/services/product.service';
import { SignalrService } from '../../../core/services/signalr.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { Branch } from '../../../core/models/branch.model';
import { BranchProduct } from '../../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
  branches: Branch[] = [];
  selectedBranch: Branch | null = null;
  products: BranchProduct[] = [];
  loading = true;
  productsLoading = false;

  constructor(
    private branchService: BranchService,
    private productService: ProductService,
    private signalrService: SignalrService,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadBranches();
    this.startSignalR();
  }

  loadBranches() {
    this.branchService.getAll().subscribe(res => {
      this.branches = res.data;
      const def = this.branches.find(b => b.isDefault) ?? this.branches[0];
      this.selectBranch(def);
      this.loading = false;
    });
  }

  selectBranch(branch: Branch) {
    if (this.selectedBranch) {
      this.signalrService.leaveBranch(this.selectedBranch.id);
    }

    this.selectedBranch = branch;
    this.signalrService.joinBranch(branch.id);
    this.loadProducts(branch.id);
  }

  loadProducts(branchId: number) {
    this.productsLoading = true;
    this.productService.getByBranch(branchId).subscribe(res => {
      this.products = res.data;
      this.productsLoading = false;
    });
  }

  startSignalR() {
    const token = this.authService.getToken();
    if (!token) return;

    this.signalrService.startConnection(token).then(() => {
      if (this.selectedBranch) {
        this.signalrService.joinBranch(this.selectedBranch.id);
      }
    });

    // تحديث الـ stock real-time
    this.signalrService.stockUpdated$.subscribe(data => {
      if (data.branchId === this.selectedBranch?.id) {
        const product = this.products.find(p => p.productId === data.productId);
        if (product) {
          product.stock = data.newStock;
        }
      }
    });

    // تحديث كل منتجات الفرع
    this.signalrService.branchProductsUpdated$.subscribe(data => {
      if (data.branchId === this.selectedBranch?.id) {
        this.loadProducts(data.branchId);
      }
    });
  }

  addToCart(product: BranchProduct) {
    if (!this.selectedBranch) return;
    this.cartService.addItem(this.selectedBranch.id, product.productId, 1)
      .subscribe();
  }

  ngOnDestroy() {
    if (this.selectedBranch) {
      this.signalrService.leaveBranch(this.selectedBranch.id);
    }
    this.signalrService.stopConnection();
  }
}
