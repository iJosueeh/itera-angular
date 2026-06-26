import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStorageService } from '@shared/services/auth-storage.service';

/**
 * Functional guard that protects authenticated-only routes.
 * If the user is not authenticated, redirects to /auth/login
 * with the original URL as a `returnUrl` query parameter.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authStorage = inject(AuthStorageService);
  const router = inject(Router);

  if (authStorage.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
