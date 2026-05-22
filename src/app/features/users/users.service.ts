import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../core/config/config';
import { AppUser, CreateUserRequest } from '../../shared/Models/users/user.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private url = `${APP_CONFIG.apiUrl}/Users`;

  getAll(): Observable<AppUser[]> { return this.http.get<AppUser[]>(this.url); }
  create(req: CreateUserRequest): Observable<AppUser> { return this.http.post<AppUser>(this.url, req); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
