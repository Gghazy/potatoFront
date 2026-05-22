import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { APP_ROUTES } from '../constants/app.constants';

export const authGuard: CanActivateFn = (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const auth = inject(AuthService);
  if (auth.hasValidToken()) return true;

  const router = inject(Router);
  return router.createUrlTree([APP_ROUTES.AUTH_LOGIN], { queryParams: { returnUrl: state?.url ?? APP_ROUTES.FEATURES } });
};
