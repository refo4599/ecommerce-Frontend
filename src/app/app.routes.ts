import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

export const routes: Routes = [
  // Default
  {
    path: '',
    canActivate: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      if (!auth.isLoggedIn()) {
        router.navigate(['/login']);
      } else if (auth.getRole() === 'Admin') {
        router.navigate(['/admin/dashboard']);
      } else {
        router.navigate(['/home']);
      }
      return false;
    }],
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  // Auth
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component')
        .then(m => m.RegisterComponent)
  },

  // Customer
  {
    path: 'home',
    loadComponent: () =>
      import('./features/customer/home/home.component')
        .then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/customer/products/products.component')
        .then(m => m.ProductsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/customer/cart/cart.component')
        .then(m => m.CartComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/customer/orders/orders.component')
        .then(m => m.OrdersComponent),
    canActivate: [authGuard]
  },

  // Admin
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/manage-products/manage-products.component')
            .then(m => m.ManageProductsComponent)
      },
      {
        path: 'branches',
        loadComponent: () =>
          import('./features/admin/manage-branches/manage-branches.component')
            .then(m => m.ManageBranchesComponent)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/manage-orders/manage-orders.component')
            .then(m => m.ManageOrdersComponent)
      }
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'login' }
];
