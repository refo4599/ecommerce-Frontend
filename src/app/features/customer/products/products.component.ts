import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { BranchProduct } from '../../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
  products: BranchProduct[] = [];
  loading = true;
  branchId: number = 0;
  categoryId: number | null = null;
  cartCount = 0;
  addedProductId: number | null = null;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.branchId = +params['branchId'];
      this.categoryId = params['categoryId'] ? +params['categoryId'] : null;
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading = true;
    this.productService.getByBranch(this.branchId).subscribe(res => {
      const all = res.data;
      this.products = this.categoryId
        ? all.filter(p => p.category?.id === this.categoryId)
        : all;
      this.loading = false;
    });
  }

  get categoryName(): string {
    if (!this.products.length) return '';
    return this.products[0]?.category?.nameAr ?? '';
  }

  addToCart(product: BranchProduct) {
    if (product.stock === 0) return;
    this.errorMessage = null;

    this.cartService.addItem(this.branchId, product.id, 1).subscribe({
      next: () => {
        this.cartCount++;
        this.addedProductId = product.id;
        setTimeout(() => this.addedProductId = null, 1500);
      },
      error: (err) => {
        const msg = err?.error?.message ?? '';
        this.errorMessage = msg || 'حصل خطأ، حاول تاني';
        setTimeout(() => this.errorMessage = null, 3000);
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
