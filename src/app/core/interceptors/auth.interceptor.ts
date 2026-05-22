import { Injectable, inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SeasonContextService } from '../services/season-context.service';
import { APP_ROUTES, HTTP_STATUS, STORAGE_KEYS } from '../constants/app.constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private auth = inject(AuthService);
  private seasonContext = inject(SeasonContextService);
  private router = inject(Router);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.getToken();
    const lang = localStorage.getItem(STORAGE_KEYS.LANG) || 'ar';

    const headers: Record<string, string> = { 'Accept-Language': lang };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    // Carry the selected season so backend query filters see the same scope as the UI.
    const seasonId = this.seasonContext.selectedSeasonId();
    if (seasonId !== null) headers['X-Season-Id'] = String(seasonId);

    const authReq = req.clone({ setHeaders: headers });

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === HTTP_STATUS.UNAUTHORIZED) {
          this.auth.clear();
          this.router.navigate([APP_ROUTES.AUTH_LOGIN], { queryParams: { returnUrl: this.router.url } });
        }
        return throwError(() => err);
      })
    );
  }
}
