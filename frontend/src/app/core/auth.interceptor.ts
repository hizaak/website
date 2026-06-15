import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Intercepteur JWT pour l'administration.
 * Module isolé — remplaçable par une authentification réelle.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt');
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  if (token && isApiRequest && isProtectedMethod(req.method)) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  return next(req);
};

function isProtectedMethod(method: string): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
}
