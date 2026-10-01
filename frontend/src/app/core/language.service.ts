import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

// First of the visitor's preferred browser languages that the site supports
// ("fr-CA" counts as fr), English otherwise (and when pre-rendering).
export function detectBrowserLanguage(): 'fr' | 'en' {
  if (typeof navigator === 'undefined') {
    return 'en';
  }

  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const language of preferred) {
    const code = language?.slice(0, 2).toLowerCase();
    if (code === 'fr' || code === 'en') {
      return code;
    }
  }

  return 'en';
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private lang: 'fr' | 'en' = 'en';

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['fr', 'en']);
    this.translate.use('en');
  }

  setLanguage(lang: string) {
    if (lang === 'fr' || lang === 'en') {
      this.lang = lang;
      this.translate.use(lang);
    }
  }

  get currentLang(): string {
    return this.lang;
  }
}
