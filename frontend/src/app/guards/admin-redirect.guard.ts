import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/api/auth.service';
import { AdminNavigationService } from '../core/admin-navigation.service';

// /admin itself has no page: it leads to the works, or to the login page.
export const adminRedirectGuard: CanActivateFn = (route, state) => {
  const adminNavigation = inject(AdminNavigationService);
  const target = inject(AuthService).isAuthenticated()
    ? adminNavigation.urlForWorks(state.url)
    : adminNavigation.urlForAuth(state.url);

  return inject(Router).parseUrl(target);
};
