import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    UrlTree,
} from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class LanguageGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
        const lang = route.paramMap.get('lang');

        if (lang === 'fr' || lang === 'en') {
            return true;
        }

        return this.router.createUrlTree(['en', 'works']);
    }
}