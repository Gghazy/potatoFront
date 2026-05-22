import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { APP_CONFIG } from '../config/config';
import { AuthService } from './auth.service';
import { AuthResponse, LoginRequest } from '../../shared/Models/auth/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private url = `${APP_CONFIG.apiUrl}/Auth`;

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`, req)
      .pipe(tap(res => this.auth.setToken(res.token)));
  }
}
