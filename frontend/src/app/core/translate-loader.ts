import { Injectable } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import en from '../../i18n/en.json';
import fr from '../../i18n/fr.json';

const TRANSLATIONS: Record<string, TranslationObject> = { en, fr };

// The translations are bundled with the app rather than fetched: a few
// kilobytes, one request less before the first page shows, and available at
// once when pages are pre-rendered at build time.
@Injectable()
export class BundledTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    return of(TRANSLATIONS[lang] ?? en);
  }
}
