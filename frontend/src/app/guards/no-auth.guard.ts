import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../core/auth.service'; // Assurez-vous que votre service AuthService est bien importé

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Vérifie si l'utilisateur est authentifié (si un token est présent dans le localStorage)
    if (this.authService.isAuthenticated()) {
      // Si l'utilisateur est authentifié, on le redirige vers le tableau de bord
      this.router.navigate(['/admin-dashboard']);
      return false; // Empêche l'accès à la route de connexion
    }
    // Si l'utilisateur n'est pas authentifié, il peut accéder à la route de connexion
    return true;
  }
}
