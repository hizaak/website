import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

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