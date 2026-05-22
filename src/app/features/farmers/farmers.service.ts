import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../core/config/config';
import {
  CreateFarmerRequest,
  Farmer,
  UpdateFarmerRequest,
} from '../../shared/Models/farmers/farmer.models';

@Injectable({ providedIn: 'root' })
export class FarmersService {
  private http = inject(HttpClient);
  private url = `${APP_CONFIG.apiUrl}/Farmers`;

  getAll(search?: string): Observable<Farmer[]> {
    let params = new HttpParams();
    if (search?.trim()) params = params.set('search', search.trim());
    return this.http.get<Farmer[]>(this.url, { params });
  }

  create(req: CreateFarmerRequest): Observable<Farmer> {
    return this.http.post<Farmer>(this.url, req);
  }

  update(id: number, req: UpdateFarmerRequest): Observable<Farmer> {
    return this.http.put<Farmer>(`${this.url}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
