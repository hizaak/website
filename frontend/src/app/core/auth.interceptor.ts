import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from './api-endpoints';
import { AdminNavigationService } from './admin-navigation.service';
import { AuthService, getStoredToken } from '../services/api/auth.service';

/**
 * Adds the admin token to API requests, and sends the admin back to the
 * login page once the token has expired (it lasts one hour).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getStoredToken();
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  // Sent on every API request, reads included: some admin reads (the
  // documents list) are protected, and public routes simply ignore it.
  if (!token || !isApiRequest) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);
  const adminNavigation = inject(AdminNavigationService);

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(cloned).pipe(
    catchError((error: unknown) => {
      // A 401 from the login itself means wrong credentials, not an
      // expired session.
      const isLogin = req.url.endsWith(`/${API_ENDPOINTS.auth.login}`);

      if (error instanceof HttpErrorResponse && error.status === 401 && !isLogin) {
        authService.logout();
        router.navigateByUrl(adminNavigation.urlForAuth());
      }

      return throwError(() => error);
    })
  );
};
