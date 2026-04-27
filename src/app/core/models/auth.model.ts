export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Customer';
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
