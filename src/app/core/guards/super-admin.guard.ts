import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { APP_ROUTES } from '../constants/app.constants';

export const superAdminGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const auth = inject(AuthService);
  if (auth.hasValidToken() && auth.isSuperAdmin) return true;

  if (auth.hasValidToken()) {
    inject(ToastrService).warning('هذه الصفحة متاحة للمدير العام فقط');
    return inject(Router).createUrlTree([APP_ROUTES.FEATURES]);
  }

  return inject(Router).createUrlTree([APP_ROUTES.AUTH_LOGIN]);
};
