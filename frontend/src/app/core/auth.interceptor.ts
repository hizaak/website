import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Intercepteur JWT pour l'administration.
 * Module isolé — remplaçable par une authentification réelle.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt');
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  // Sent on every API request, reads included: some admin reads (the
  // documents list) are protected, and public routes simply ignore it.
  if (token && isApiRequest) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  return next(req);
};
