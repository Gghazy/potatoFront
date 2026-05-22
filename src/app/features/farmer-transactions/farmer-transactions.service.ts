import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../core/config/config';
import {
  AddPaymentRequest,
  CreateFarmerTransactionRequest,
  FarmerPayment,
  FarmerTransaction,
  FarmerTransactionItem,
  FarmerTransactionsSummary,
  UpdateFarmerTransactionRequest,
} from '../../shared/Models/farmer-transactions/farmer-transaction.models';
import { ListQuery, PagedResult } from '../../shared/Models/common/paged-result';

@Injectable({ providedIn: 'root' })
export class FarmerTransactionsService {
  private http = inject(HttpClient);
  private url = `${APP_CONFIG.apiUrl}/FarmerTransactions`;

  getAll(query: ListQuery = {}): Observable<PagedResult<FarmerTransaction>> {
    let params = new HttpParams();
    if (query.search?.trim()) params = params.set('search', query.search.trim());
    if (query.from) params = params.set('from', query.from);
    if (query.to) params = params.set('to', query.to);
    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    return this.http.get<PagedResult<FarmerTransaction>>(this.url, { params });
  }

  get(id: number): Observable<FarmerTransaction> { return this.http.get<FarmerTransaction>(`${this.url}/${id}`); }
  create(req: CreateFarmerTransactionRequest): Observable<FarmerTransaction> { return this.http.post<FarmerTransaction>(this.url, req); }
  update(id: number, req: UpdateFarmerTransactionRequest): Observable<FarmerTransaction> { return this.http.put<FarmerTransaction>(`${this.url}/${id}`, req); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  summary(): Observable<FarmerTransactionsSummary> { return this.http.get<FarmerTransactionsSummary>(`${this.url}/summary`); }

  uploadItemImage(transactionId: number, itemId: number, file: File): Observable<FarmerTransactionItem> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<FarmerTransactionItem>(`${this.url}/${transactionId}/items/${itemId}/image`, fd);
  }
  deleteItemImage(transactionId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${transactionId}/items/${itemId}/image`);
  }

  close(id: number): Observable<FarmerTransaction> {
    return this.http.post<FarmerTransaction>(`${this.url}/${id}/close`, {});
  }
  reopen(id: number): Observable<FarmerTransaction> {
    return this.http.post<FarmerTransaction>(`${this.url}/${id}/reopen`, {});
  }

  addPayment(id: number, payment: AddPaymentRequest): Observable<FarmerPayment> {
    return this.http.post<FarmerPayment>(`${this.url}/${id}/payments`, payment);
  }
  deletePayment(id: number, paymentId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}/payments/${paymentId}`);
  }
}
