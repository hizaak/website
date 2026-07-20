import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/api/auth.service';
import { AdminNavigationService } from '../core/admin-navigation.service';

@Injectable({
  providedIn: 'root',
})
export class AdminRedirectGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private adminNavigation: AdminNavigationService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): UrlTree {
    const target = this.authService.isAuthenticated()
      ? this.adminNavigation.urlForWorks(state.url)
      : this.adminNavigation.urlForAuth(state.url);

    return this.router.parseUrl(target);
  }
}
