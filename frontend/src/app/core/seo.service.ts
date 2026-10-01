import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { environment } from '../../environments/environment';

// Translation keys a route declares in its `data.seo`.
interface SeoRouteData {
  title: string;
  description?: string;
  noindex?: boolean;
}

type Lang = 'fr' | 'en';

const LANGS: Lang[] = ['fr', 'en'];
const OG_LOCALES: Record<Lang, string> = { fr: 'fr_FR', en: 'en_US' };

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private pending?: Subscription;

  constructor(
    private title: Title,
    private meta: Meta,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  // Called after every navigation. Routes with a static title declare it in
  // `data.seo`; pages whose title depends on loaded content (a work) call
  // setWorkPage themselves once it has loaded.
  updateForRoute(lang: Lang, url: string, root: ActivatedRouteSnapshot): void {
    this.pending?.unsubscribe();

    const path = url.split(/[?#]/)[0];
    const seo = this.deepest(root).data['seo'] as SeoRouteData | undefined;

    this.document.documentElement.lang = lang;
    this.meta.updateTag({ property: 'og:locale', content: OG_LOCALES[lang] });
    this.meta.updateTag({ name: 'robots', content: seo?.noindex ? 'noindex, nofollow' : 'index, follow' });
    this.meta.removeTag("property='og:image'");
    this.setUrls(path);

    if (!seo) {
      return;
    }

    const keys = seo.description ? [seo.title, seo.description] : [seo.title];

    this.pending = this.translate
      .get(keys, undefined, lang)
      .subscribe((texts: Record<string, string>) =>
        this.setPage(texts[seo.title], seo.description && texts[seo.description])
      );
  }

  setWorkPage(lang: Lang, workTitle: string, imageUrl: string): void {
    this.pending?.unsubscribe();

    this.pending = this.translate
      .get(['seo.work.title', 'seo.work.description'], { work: workTitle }, lang)
      .subscribe((texts: Record<string, string>) => {
        this.setPage(texts['seo.work.title'], texts['seo.work.description']);
        this.meta.updateTag({ property: 'og:image', content: imageUrl });
      });
  }

  // For content that turns out not to exist once loaded (an unknown work).
  setNotFound(lang: Lang): void {
    this.pending?.unsubscribe();

    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.pending = this.translate
      .get('seo.notFound.title', undefined, lang)
      .subscribe((title: string) => this.setPage(title));
  }

  private setPage(title: string, description?: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({ property: 'og:title', content: title });

    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
    }
  }

  // Canonical URL plus one hreflang alternate per language, so search engines
  // index /fr/... and /en/... as translations of each other, not duplicates.
  private setUrls(path: string): void {
    const head = this.document.head;
    head.querySelectorAll('link[data-seo]').forEach(link => link.remove());

    const canonical = `${environment.siteUrl}${path}`;
    this.addLink({ rel: 'canonical', href: canonical });
    this.meta.updateTag({ property: 'og:url', content: canonical });

    const rest = path.replace(/^\/(fr|en)(?=\/|$)/, '');
    for (const lang of LANGS) {
      this.addLink({ rel: 'alternate', hreflang: lang, href: `${environment.siteUrl}/${lang}${rest}` });
    }
    this.addLink({ rel: 'alternate', hreflang: 'x-default', href: `${environment.siteUrl}/en${rest}` });
  }

  private addLink(attributes: Record<string, string>): void {
    const link = this.document.createElement('link');
    link.setAttribute('data-seo', '');
    for (const [name, value] of Object.entries(attributes)) {
      link.setAttribute(name, value);
    }
    this.document.head.appendChild(link);
  }

  private deepest(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
