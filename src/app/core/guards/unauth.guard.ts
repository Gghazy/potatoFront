import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { APP_ROUTES } from '../constants/app.constants';

export const unauthGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const auth = inject(AuthService);
  if (!auth.hasValidToken()) return true;

  return inject(Router).createUrlTree([APP_ROUTES.FEATURES]);
};
