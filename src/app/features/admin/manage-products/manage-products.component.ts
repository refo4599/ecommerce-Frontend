import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { Branch } from '../../../core/models/branch.model';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-products.component.html'
})
export class ManageProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  branches: Branch[] = [];
  loading = true;
  showForm = false;
  showAssignForm = false;
  editingProduct: Product | null = null;
  uploading = false;
  previewUrl: string | null = null;

  form = {
    name: '',
    description: '',
    basePrice: 0,
    categoryId: 0,
    imageUrl: ''
  };

  assignForm = {
    productId: 0,
    branchId: 0,
    stock: 0,
    priceOverride: null as number | null
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.http.get<{success: boolean, data: Product[]}>
      (`${environment.apiUrl}/products`).subscribe(res => {
      this.products = res.data;
      this.loading = false;
    });

    this.http.get<{success: boolean, data: Category[]}>
      (`${environment.apiUrl}/categories`).subscribe(res => {
      this.categories = res.data;
    });

    this.http.get<{success: boolean, data: Branch[]}>
      (`${environment.apiUrl}/branches`).subscribe(res => {
      this.branches = res.data;
    });
  }

  openAdd() {
    this.editingProduct = null;
    this.form = { name: '', description: '', basePrice: 0, categoryId: 0, imageUrl: '' };
    this.previewUrl = null;
    this.showForm = true;
  }

  openEdit(product: Product) {
    this.editingProduct = product;
    this.form = {
      name: product.name,
      description: product.description ?? '',
      basePrice: product.basePrice,
      categoryId: product.category?.id ?? 0,
      imageUrl: product.imageUrl ?? ''
    };
    this.previewUrl = product.imageUrl ?? null;
    this.showForm = true;
  }

  openAssign(product: Product) {
    this.assignForm = {
      productId: product.id,
      branchId: this.branches[0]?.id ?? 0,
      stock: 0,
      priceOverride: null
    };
    this.showAssignForm = true;
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploading = true;
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<{success: boolean, data: {url: string}}>
      (`${environment.apiUrl}/uploads`, formData).subscribe({
      next: res => {
        this.form.imageUrl = res.data.url;
        this.previewUrl = res.data.url;
        this.uploading = false;
      },
      error: () => { this.uploading = false; }
    });
  }

  save() {
    const body = {
      name: this.form.name,
      description: this.form.description || null,
      basePrice: this.form.basePrice,
      categoryId: this.form.categoryId,
      imageUrl: this.form.imageUrl || null
    };

    if (this.editingProduct) {
      this.http.put(`${environment.apiUrl}/products/${this.editingProduct.id}`, body)
        .subscribe(() => { this.showForm = false; this.loadAll(); });
    } else {
      this.http.post(`${environment.apiUrl}/products`, body)
        .subscribe(() => { this.showForm = false; this.loadAll(); });
    }
  }

  saveAssign() {
    this.http.post(`${environment.apiUrl}/products/branch/${this.assignForm.branchId}/assign`, {
      productId: this.assignForm.productId,
      stock: this.assignForm.stock,
      priceOverride: this.assignForm.priceOverride
    }).subscribe(() => {
      this.showAssignForm = false;
    });
  }

  delete(id: number) {
    if (!confirm('هل أنت متأكد من حذف المنتج؟')) return;
    this.http.delete(`${environment.apiUrl}/products/${id}`)
      .subscribe(() => this.loadAll());
  }

  cancel() {
    this.showForm = false;
    this.showAssignForm = false;
  }
}
