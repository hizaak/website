import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/api/auth.service';
import { AdminNavigationService } from '../core/admin-navigation.service';

// Login page: a signed-in admin goes straight to the works.
export const noAuthGuard: CanActivateFn = (route, state) =>
  !inject(AuthService).isAuthenticated() ||
  inject(Router).parseUrl(inject(AdminNavigationService).urlForWorks(state.url));
