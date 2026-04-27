import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Branch } from '../models/branch.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private url = `${environment.apiUrl}/branches`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<{success: boolean, data: Branch[]}>(`${this.url}`);
  }

  getById(id: number) {
    return this.http.get<{success: boolean, data: Branch}>(`${this.url}/${id}`);
  }

  create(data: Partial<Branch>) {
    return this.http.post<{success: boolean, data: Branch}>(`${this.url}`, data);
  }

  update(id: number, data: Partial<Branch>) {
    return this.http.put<{success: boolean, data: Branch}>(`${this.url}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<{success: boolean}>(`${this.url}/${id}`);
  }
}
