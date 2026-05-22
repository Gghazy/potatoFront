import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../core/config/config';
import {
  AddTraderPaymentRequest,
  CreateTraderTransactionRequest,
  TraderPayment,
  TraderTransaction,
  TraderTransactionItem,
  TraderTransactionsSummary,
  UpdateTraderTransactionRequest,
} from '../../shared/Models/trader-transactions/trader-transaction.models';
import { ListQuery, PagedResult } from '../../shared/Models/common/paged-result';

@Injectable({ providedIn: 'root' })
export class TraderTransactionsService {
  private http = inject(HttpClient);
  private url = `${APP_CONFIG.apiUrl}/TraderTransactions`;

  getAll(query: ListQuery = {}): Observable<PagedResult<TraderTransaction>> {
    let params = new HttpParams();
    if (query.search?.trim()) params = params.set('search', query.search.trim());
    if (query.from) params = params.set('from', query.from);
    if (query.to) params = params.set('to', query.to);
    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    return this.http.get<PagedResult<TraderTransaction>>(this.url, { params });
  }

  get(id: number): Observable<TraderTransaction> { return this.http.get<TraderTransaction>(`${this.url}/${id}`); }
  create(req: CreateTraderTransactionRequest): Observable<TraderTransaction> { return this.http.post<TraderTransaction>(this.url, req); }
  update(id: number, req: UpdateTraderTransactionRequest): Observable<TraderTransaction> { return this.http.put<TraderTransaction>(`${this.url}/${id}`, req); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  summary(): Observable<TraderTransactionsSummary> { return this.http.get<TraderTransactionsSummary>(`${this.url}/summary`); }

  close(id: number): Observable<TraderTransaction> { return this.http.post<TraderTransaction>(`${this.url}/${id}/close`, {}); }
  reopen(id: number): Observable<TraderTransaction> { return this.http.post<TraderTransaction>(`${this.url}/${id}/reopen`, {}); }

  uploadItemImage(transactionId: number, itemId: number, file: File): Observable<TraderTransactionItem> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<TraderTransactionItem>(`${this.url}/${transactionId}/items/${itemId}/image`, fd);
  }
  deleteItemImage(transactionId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${transactionId}/items/${itemId}/image`);
  }

  addPayment(id: number, payment: AddTraderPaymentRequest): Observable<TraderPayment> {
    return this.http.post<TraderPayment>(`${this.url}/${id}/payments`, payment);
  }
  deletePayment(id: number, paymentId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}/payments/${paymentId}`);
  }
}
