import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BranchService } from '../../../core/services/branch.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  branchCount = 0;
  productCount = 0;
  loading = true;
  today = new Date();

  constructor(
    private branchService: BranchService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.branchService.getAll().subscribe(res => {
      this.branchCount = res.data.length;
    });

    this.productService.getAll().subscribe(res => {
      this.productCount = res.data.length;
      this.loading = false;
    });
  }
}
