import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BranchService } from '../../../core/services/branch.service';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService, Category } from '../../../core/services/category.service';
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
  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  loading = true;
  productsLoading = false;
  cartCount = 0;
  addedProductId: number | null = null;
  errorMessage: string | null = null;

  constructor(
    private branchService: BranchService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private signalrService: SignalrService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBranches();
    this.loadCategories();
    this.startSignalR();
  }

  loadBranches() {
    this.branchService.getAll().subscribe(res => {
      this.branches = res.data;
      const def = this.branches.find(b => b.isDefault) ?? this.branches[0];
      if (def) this.selectBranch(def);
      this.loading = false;
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(res => {
      this.categories = res.data;
    });
  }

  selectBranch(branch: Branch) {
    if (this.selectedBranch?.id === branch.id) return;
    if (this.selectedBranch) {
      this.signalrService.leaveBranch(this.selectedBranch.id);
    }
    this.selectedBranch = branch;
    this.selectedCategoryId = null;
    this.signalrService.joinBranch(branch.id);
    this.loadProducts(branch.id);
  }

selectCategory(categoryId: number | null) {
  if (!this.selectedBranch) return;
  if (categoryId === null) {
    this.router.navigate(['/products'], {
      queryParams: { branchId: this.selectedBranch.id }
    });
  } else {
    this.router.navigate(['/products'], {
      queryParams: { branchId: this.selectedBranch.id, categoryId }
    });
  }
}
  loadProducts(branchId: number) {
    this.productsLoading = true;
    this.productService.getByBranch(branchId).subscribe(res => {
      this.products = res.data;
      this.productsLoading = false;
    });
  }

  get filteredProducts(): BranchProduct[] {
    if (!this.selectedCategoryId) return this.products;
    return this.products.filter(p => p.category?.id === this.selectedCategoryId);
  }

  get selectedCategoryName(): string {
    if (!this.selectedCategoryId) return '';
    return this.categories.find(c => c.id === this.selectedCategoryId)?.nameAr ?? '';
  }

  startSignalR() {
    const token = this.authService.getToken();
    if (!token) return;

    this.signalrService.startConnection(token).then(() => {
      if (this.selectedBranch) {
        this.signalrService.joinBranch(this.selectedBranch.id);
      }
    }).catch(() => {});

    this.signalrService.stockUpdated$.subscribe(data => {
      if (data.branchId === this.selectedBranch?.id) {
        const product = this.products.find(p => p.id === data.productId);
        if (product) product.stock = data.newStock;
      }
    });

    this.signalrService.branchProductsUpdated$.subscribe(data => {
      if (data.branchId === this.selectedBranch?.id) {
        this.loadProducts(data.branchId);
      }
    });
  }

  addToCart(product: BranchProduct) {
    if (!this.selectedBranch || product.stock === 0) return;
    this.errorMessage = null;

    this.cartService.addItem(this.selectedBranch.id, product.id, 1).subscribe({
      next: () => {
        this.cartCount++;
        this.addedProductId = product.id;
        setTimeout(() => this.addedProductId = null, 1500);
      },
      error: (err) => {
        const msg = err?.error?.message ?? '';
        if (msg === 'DIFFERENT_BRANCH' || msg === 'عندك منتجات من فرع تاني في الكارت') {
          const confirmed = window.confirm(
            'عندك منتجات من فرع تاني في الكارت.\nهتبدأ كارت جديد وتحذف المنتجات القديمة؟'
          );
          if (confirmed) {
            this.cartService.switchBranch(this.selectedBranch!.id).subscribe({
              next: () => {
                this.cartService.addItem(this.selectedBranch!.id, product.id, 1).subscribe({
                  next: () => {
                    this.cartCount = 1;
                    this.addedProductId = product.id;
                    setTimeout(() => this.addedProductId = null, 1500);
                  }
                });
              }
            });
          }
        } else {
          this.errorMessage = msg || 'حصل خطأ، حاول تاني';
          setTimeout(() => this.errorMessage = null, 3000);
        }
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  ngOnDestroy() {
    if (this.selectedBranch) {
      this.signalrService.leaveBranch(this.selectedBranch.id);
    }
    this.signalrService.stopConnection();
  }
}
