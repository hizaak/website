import { Component } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';

import { filter } from 'rxjs';

import { HeaderComponent } from './shared/components/header/header.component';

import { LanguageService } from './core/language.service';
import { SeoService } from './core/seo.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {

  constructor(
    private router: Router,
    private languageService: LanguageService,
    private seoService: SeoService
  ) {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(() => {
        const lang = this.router.url.split('/')[1];

        if (lang === 'fr' || lang === 'en') {
          this.languageService.setLanguage(lang);
          this.seoService.updateForRoute(
            lang,
            this.router.url,
            this.router.routerState.snapshot.root
          );
        }
      });
  }
}
