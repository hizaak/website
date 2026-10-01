import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/api/auth.service';
import { AdminNavigationService } from '../core/admin-navigation.service';

// Admin pages: signed-out visitors go to the login page.
export const authGuard: CanActivateFn = (route, state) =>
  inject(AuthService).isAuthenticated() ||
  inject(Router).parseUrl(inject(AdminNavigationService).urlForAuth(state.url));
