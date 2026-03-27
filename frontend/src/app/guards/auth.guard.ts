import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../core/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Vérifier si l'utilisateur est authentifié
    if (this.authService.isAuthenticated()) {
      // Si l'utilisateur est authentifié, continuer vers la route demandée
      return true;
    } else {
      // Sinon, rediriger vers la page de connexion
      this.router.navigate(['/admin']);
      return false;
    }
  }
}
