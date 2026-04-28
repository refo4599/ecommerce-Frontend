import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-categories.component.html'
})
export class ManageCategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  showForm = false;
  editingCategory: Category | null = null;
  uploading = false;
  previewUrl: string | null = null;

  form = {
    name: '',
    description: '',
    imageUrl: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.http.get<{success: boolean, data: Category[]}>
      (`${environment.apiUrl}/categories`).subscribe(res => {
      this.categories = res.data;
      this.loading = false;
    });
  }

  openAdd() {
    this.editingCategory = null;
    this.form = { name: '', description: '', imageUrl: '' };
    this.previewUrl = null;
    this.showForm = true;
  }

  openEdit(category: Category) {
    this.editingCategory = category;
    this.form = {
      name: category.name,
      description: category.description ?? '',
      imageUrl: category.imageUrl ?? ''
    };
    this.previewUrl = category.imageUrl ?? null;
    this.showForm = true;
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
      imageUrl: this.form.imageUrl || null
    };

    if (this.editingCategory) {
      this.http.put(`${environment.apiUrl}/categories/${this.editingCategory.id}`, body)
        .subscribe(() => { this.showForm = false; this.loadCategories(); });
    } else {
      this.http.post(`${environment.apiUrl}/categories`, body)
        .subscribe(() => { this.showForm = false; this.loadCategories(); });
    }
  }

  delete(id: number) {
    if (!confirm('هل أنت متأكد من حذف الكاتيجوري؟')) return;
    this.http.delete(`${environment.apiUrl}/categories/${id}`)
      .subscribe(() => this.loadCategories());
  }

  cancel() {
    this.showForm = false;
  }
}
