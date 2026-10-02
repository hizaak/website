import { RenderMode, ServerRoute } from '@angular/ssr';

// Pages whose content doesn't depend on the database are pre-rendered at
// build time into plain HTML files: search engines that don't run JavaScript
// see their text, and they show before the app has loaded. The home page and
// the works list are pre-rendered without their photo or list, which the
// browser loads so that they are never stale.
//
// Everything else is rendered in the browser from index.csr.html. nginx.conf
// decides which of those addresses answer 200 and which 404.
const PRERENDERED = ['', 'works', 'about', 'contact', 'legal'];

export const serverRoutes: ServerRoute[] = [
  ...['fr', 'en'].flatMap((lang) =>
    PRERENDERED.map((page): ServerRoute => ({
      path: page ? `${lang}/${page}` : lang,
      renderMode: RenderMode.Prerender,
    }))
  ),
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
