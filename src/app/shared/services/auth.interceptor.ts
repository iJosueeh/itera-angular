import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStorageService } from '../services/auth-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Ensure withCredentials: true for all requests to the backend
  // This tells the browser to include the HttpOnly cookie
  if (req.url.includes('/api/')) {
    const authReq = req.clone({
      withCredentials: true
    });
    return next(authReq);
  }

  return next(req);
};
