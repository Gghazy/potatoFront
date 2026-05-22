import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../core/config/config';
import {
  CreateSeasonRequest,
  Season,
  UpdateSeasonRequest,
} from '../../shared/Models/seasons/season.models';

@Injectable({ providedIn: 'root' })
export class SeasonsService {
  private http = inject(HttpClient);
  private url = `${APP_CONFIG.apiUrl}/Seasons`;

  getAll(): Observable<Season[]> { return this.http.get<Season[]>(this.url); }
  create(req: CreateSeasonRequest): Observable<Season> { return this.http.post<Season>(this.url, req); }
  update(id: number, req: UpdateSeasonRequest): Observable<Season> { return this.http.put<Season>(`${this.url}/${id}`, req); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  setDefault(id: number): Observable<Season> { return this.http.post<Season>(`${this.url}/${id}/set-default`, {}); }
}
