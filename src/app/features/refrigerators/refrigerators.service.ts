import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../core/config/config';
import {
  CreateRefrigeratorRequest,
  Refrigerator,
  RefrigeratorExpense,
  RefrigeratorExpenseInput,
  RefrigeratorItem,
  RefrigeratorItemInput,
  RefrigeratorsSummary,
  UpdateRefrigeratorRequest,
} from '../../shared/Models/refrigerators/refrigerator.models';

@Injectable({ providedIn: 'root' })
export class RefrigeratorsService {
  private http = inject(HttpClient);
  private url = `${APP_CONFIG.apiUrl}/Refrigerators`;

  // ===== Refrigerator CRUD =====
  getAll(search?: string): Observable<Refrigerator[]> {
    let params = new HttpParams();
    if (search?.trim()) params = params.set('search', search.trim());
    return this.http.get<Refrigerator[]>(this.url, { params });
  }
  get(id: number): Observable<Refrigerator> { return this.http.get<Refrigerator>(`${this.url}/${id}`); }
  create(req: CreateRefrigeratorRequest): Observable<Refrigerator> { return this.http.post<Refrigerator>(this.url, req); }
  update(id: number, req: UpdateRefrigeratorRequest): Observable<Refrigerator> { return this.http.put<Refrigerator>(`${this.url}/${id}`, req); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  summary(): Observable<RefrigeratorsSummary> { return this.http.get<RefrigeratorsSummary>(`${this.url}/summary`); }

  // ===== Items =====
  addItem(id: number, item: RefrigeratorItemInput): Observable<RefrigeratorItem> {
    return this.http.post<RefrigeratorItem>(`${this.url}/${id}/items`, item);
  }
  updateItem(id: number, itemId: number, item: RefrigeratorItemInput): Observable<RefrigeratorItem> {
    return this.http.put<RefrigeratorItem>(`${this.url}/${id}/items/${itemId}`, item);
  }
  deleteItem(id: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}/items/${itemId}`);
  }

  // ===== Expenses =====
  addExpense(id: number, exp: RefrigeratorExpenseInput): Observable<RefrigeratorExpense> {
    return this.http.post<RefrigeratorExpense>(`${this.url}/${id}/expenses`, exp);
  }
  updateExpense(id: number, expenseId: number, exp: RefrigeratorExpenseInput): Observable<RefrigeratorExpense> {
    return this.http.put<RefrigeratorExpense>(`${this.url}/${id}/expenses/${expenseId}`, exp);
  }
  deleteExpense(id: number, expenseId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}/expenses/${expenseId}`);
  }
}
