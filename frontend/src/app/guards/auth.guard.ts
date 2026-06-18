import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../core/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    console.log('AUTH GUARD');
    console.log('URL =', state.url);
    console.log('AUTH =', this.authService.isAuthenticated());

    if (this.authService.isAuthenticated()) {
      return true;
    }

    const lang = state.url.startsWith('/fr') ? 'fr' : 'en';

    console.log('REDIRECT TO', `/${lang}/admin/auth`);

    this.router.navigate([lang, 'admin', 'auth']);

    return false;
  }
}