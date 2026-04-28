import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { BranchService } from '../../core/services/branch.service';
import { CartService } from '../../core/services/cart.service';
import { AuthResponse } from '../../core/models/auth.model';
import { Branch } from '../../core/models/branch.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  branches: Branch[] = [];
  selectedBranch: Branch | null = null;
  cartCount = 0;

  constructor(
    private authService: AuthService,
    private branchService: BranchService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && !this.isAdmin()) {
        this.loadBranches();
      }
    });

    // اسمع على queryParams عشان لو الـ home غيّر الفرع يتحدث الـ navbar
    this.route.queryParams.subscribe(params => {
      const branchId = params['branchId'] ? +params['branchId'] : null;
      if (branchId && this.branches.length > 0) {
        const branch = this.branches.find(b => b.id === branchId);
        if (branch && branch.id !== this.selectedBranch?.id) {
          this.selectedBranch = branch;
          this.loadCartCount(branch.id);
        }
      }
    });
  }

  loadBranches() {
    this.branchService.getAll().subscribe(res => {
      this.branches = res.data;

      // اقرأ الـ branchId من الـ URL الحالي لو موجود
      const branchIdParam = this.route.snapshot.queryParamMap.get('branchId');
      const branchId = branchIdParam ? +branchIdParam : null;

      const def = branchId
        ? (this.branches.find(b => b.id === branchId) ?? this.branches[0])
        : this.branches[0];

      if (def) {
        this.selectedBranch = def;
        this.loadCartCount(def.id);
      }
    });
  }

  loadCartCount(branchId: number) {
    this.cartService.getCart(branchId).subscribe({
      next: res => {
        this.cartCount = res.data?.items?.length ?? 0;
      },
      error: () => {
        this.cartCount = 0;
      }
    });
  }

  selectBranch(branch: Branch) {
    this.selectedBranch = branch;
    this.loadCartCount(branch.id);
    this.router.navigate(['/home'], {
      queryParams: { branchId: branch.id }
    });
  }

  goToCart() {
    this.router.navigate(['/cart'], {
      queryParams: { branchId: this.selectedBranch?.id }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAdmin() {
    return this.currentUser?.role === 'Admin';
  }
}
