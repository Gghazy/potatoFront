import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../core/config/config';
import { CreateTenantRequest, Tenant } from '../../shared/Models/tenants/tenant.models';

@Injectable({ providedIn: 'root' })
export class TenantsService {
  private http = inject(HttpClient);
  private url = `${APP_CONFIG.apiUrl}/Tenants`;

  getAll(): Observable<Tenant[]> { return this.http.get<Tenant[]>(this.url); }
  create(req: CreateTenantRequest): Observable<Tenant> { return this.http.post<Tenant>(this.url, req); }
  setActive(id: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/active`, { isActive });
  }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
