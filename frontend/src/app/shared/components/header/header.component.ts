import { ChangeDetectionStrategy, Component, afterNextRender, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import {
  RouterLink,
  RouterLinkActive,
  Router,
} from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../core/language.service';
import { AuthService } from '../../../services/api/auth.service';

@Component({
  // Updates plain fields, not signals: OnPush (the default) would miss them.
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-header',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  // Pre-rendered pages are built without a session: the admin link is only
  // added once the page runs in the browser, so that the page is picked up
  // as it was rendered.
  readonly isAdmin = signal(false);
  private rendered = false;

  constructor(
    public languageService: LanguageService,
    private authService: AuthService,
    private router: Router
  ) {
    afterNextRender(() => {
      this.rendered = true;
      this.refreshAdmin();
    });
    // Logging in or out happens through a navigation.
    this.router.events.subscribe(() => {
      if (this.rendered) {
        this.refreshAdmin();
      }
    });
  }

  languageLink(lang: 'fr' | 'en'): string[] {
    const segments = this.router.url
      .split('?')[0]
      .split('/')
      .filter(Boolean);

    if (segments[0] === 'fr' || segments[0] === 'en') {
      segments[0] = lang;
    } else {
      segments.unshift(lang);
    }

    return ['/', ...segments];
  }

  private refreshAdmin(): void {
    this.isAdmin.set(this.authService.isAuthenticated());
  }
}
