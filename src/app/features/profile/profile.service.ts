import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../core/config/config';
import {
  ChangePasswordRequest,
  Profile,
  UpdateProfileRequest,
} from '../../shared/Models/profile/profile.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private url = `${APP_CONFIG.apiUrl}/Profile`;

  get(): Observable<Profile> { return this.http.get<Profile>(`${this.url}/me`); }
  update(req: UpdateProfileRequest): Observable<Profile> { return this.http.put<Profile>(`${this.url}/me`, req); }
  changePassword(req: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/change-password`, req);
  }
}
