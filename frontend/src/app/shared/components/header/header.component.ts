import { Component } from '@angular/core';
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
  constructor(
    public languageService: LanguageService,
    public authService: AuthService,
    private router: Router
  ) {}

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
}
