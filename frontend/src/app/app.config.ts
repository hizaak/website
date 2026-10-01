import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { BundledTranslateLoader } from './core/translate-loader';
import { reloadOnStaleChunk } from './core/stale-chunk';

import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(routes, withNavigationErrorHandler(reloadOnStaleChunk)),

    // Pre-rendered pages are picked up as they are instead of being drawn
    // again. Without incremental hydration, which would add inline scripts
    // to the pages (to replay early clicks) that the site's Content Security
    // Policy blocks.
    provideClientHydration(withNoIncrementalHydration()),

    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),

    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateLoader(BundledTranslateLoader),
    }),
  ],
};
