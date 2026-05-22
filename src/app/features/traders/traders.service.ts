import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../core/config/config';
import {
  CreateTraderRequest,
  Trader,
  UpdateTraderRequest,
} from '../../shared/Models/traders/trader.models';

@Injectable({ providedIn: 'root' })
export class TradersService {
  private http = inject(HttpClient);
  private url = `${APP_CONFIG.apiUrl}/Traders`;

  getAll(search?: string): Observable<Trader[]> {
    let params = new HttpParams();
    if (search?.trim()) params = params.set('search', search.trim());
    return this.http.get<Trader[]>(this.url, { params });
  }

  create(req: CreateTraderRequest): Observable<Trader> {
    return this.http.post<Trader>(this.url, req);
  }

  update(id: number, req: UpdateTraderRequest): Observable<Trader> {
    return this.http.put<Trader>(`${this.url}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
