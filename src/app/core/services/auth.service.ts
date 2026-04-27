import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private url = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(
    JSON.parse(localStorage.getItem('user') ?? 'null')
  );

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest) {
    return this.http.post<{success: boolean, data: AuthResponse}>
      (`${this.url}/register`, data).pipe(
        tap(res => this.setUser(res.data))
      );
  }

  login(data: LoginRequest) {
    return this.http.post<{success: boolean, data: AuthResponse}>
      (`${this.url}/login`, data).pipe(
        tap(res => this.setUser(res.data))
      );
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken() {
    return this.currentUserSubject.value?.token ?? null;
  }

  getRole() {
    return this.currentUserSubject.value?.role ?? null;
  }

  isLoggedIn() {
    return !!this.currentUserSubject.value;
  }

  private setUser(user: AuthResponse) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
