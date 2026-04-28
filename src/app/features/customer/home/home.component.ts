import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BranchService } from '../../../core/services/branch.service';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { SignalrService } from '../../../core/services/signalr.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { Branch } from '../../../core/models/branch.model';
import { BranchProduct } from '../../../core/models/product.model';
import { Subscription } from 'rxjs';

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
  loading = true;
  productsLoading = false;
  cartCount = 0;
  addedProductId: number | null = null;
  errorMessage: string | null = null;
  private routeSub!: Subscription;

  constructor(
    private branchService: BranchService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private signalrService: SignalrService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.startSignalR();

    this.branchService.getAll().subscribe(res => {
      this.branches = res.data;
      this.loading = false;

      this.routeSub = this.route.queryParams.subscribe(params => {
        const branchId = params['branchId'] ? +params['branchId'] : null;
        const target = branchId
          ? (this.branches.find(b => b.id === branchId) ?? this.branches[0])
          : this.branches[0];

        if (target) this.selectBranch(target);
      });
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

    const branchId = this.selectedBranch.id;

    this.cartService.addItem(branchId, product.id, 1).subscribe({
      next: (res) => {
        this.cartCount = res.data?.items?.length ?? this.cartCount + 1;
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
            this.cartService.switchBranch(branchId).subscribe({
              next: () => {
                this.cartService.addItem(branchId, product.id, 1).subscribe({
                  next: (res) => {
                    this.cartCount = res.data?.items?.length ?? 1;
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
    this.routeSub?.unsubscribe();
  }
}
