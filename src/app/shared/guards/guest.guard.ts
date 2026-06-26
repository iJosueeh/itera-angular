import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStorageService } from '@shared/services/auth-storage.service';

/**
 * Functional guard that prevents authenticated users from
 * accessing login/register pages. Redirects to /dashboard.
 */
export const guestGuard: CanActivateFn = () => {
  const authStorage = inject(AuthStorageService);
  const router = inject(Router);

  if (!authStorage.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
