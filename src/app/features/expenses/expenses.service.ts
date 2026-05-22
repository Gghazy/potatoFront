import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../core/config/config';
import {
  CreateExpenseRequest,
  Expense,
  ExpensesSummary,
  UpdateExpenseRequest,
} from '../../shared/Models/expenses/expense.models';
import { ListQuery, PagedResult } from '../../shared/Models/common/paged-result';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private http = inject(HttpClient);
  private url = `${APP_CONFIG.apiUrl}/Expenses`;

  getAll(query: ListQuery = {}): Observable<PagedResult<Expense>> {
    let params = new HttpParams();
    if (query.search?.trim()) params = params.set('search', query.search.trim());
    if (query.from) params = params.set('from', query.from);
    if (query.to) params = params.set('to', query.to);
    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    return this.http.get<PagedResult<Expense>>(this.url, { params });
  }

  get(id: number): Observable<Expense> { return this.http.get<Expense>(`${this.url}/${id}`); }
  create(req: CreateExpenseRequest): Observable<Expense> { return this.http.post<Expense>(this.url, req); }
  update(id: number, req: UpdateExpenseRequest): Observable<Expense> { return this.http.put<Expense>(`${this.url}/${id}`, req); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  summary(): Observable<ExpensesSummary> { return this.http.get<ExpensesSummary>(`${this.url}/summary`); }
}
