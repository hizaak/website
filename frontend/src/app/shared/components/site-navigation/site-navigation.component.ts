import { Component } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { filter } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-site-navigation',
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
  ],
  templateUrl: './site-navigation.component.html',
  styleUrl: './site-navigation.component.scss',
})
export class SiteNavigationComponent {
  currentLang = 'en';

  constructor(private router: Router) {
    this.updateLang();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateLang());
  }

private updateLang() {
  const lang = this.router.url.split('/')[1];

  console.log('Current lang:', lang);

  if (lang === 'fr' || lang === 'en') {
    this.currentLang = lang;
  }
}
  
}