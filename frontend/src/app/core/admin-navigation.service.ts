import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AdminNavigationService {
  constructor(private router: Router) { }

  toAuth(): void {
    this.router.navigate(this.commands('auth'));
  }

  toWorks(): void {
    this.router.navigate(this.commands('works'));
  }

  toWork(workId: string): void {
    this.router.navigate(this.commands('works', workId));
  }

  linkForWorks(): string[] {
    return this.commands('works');
  }

  linkForDocuments(): string[] {
    return this.commands('documents');
  }

  linkForAccount(): string[] {
    return this.commands('account');
  }

  urlForAuth(sourceUrl?: string): string {
    return this.url(sourceUrl, 'auth');
  }

  urlForWorks(sourceUrl?: string): string {
    return this.url(sourceUrl, 'works');
  }

  private commands(...segments: string[]): string[] {
    return ['/', this.currentLanguage(), 'admin', ...segments];
  }

  private url(sourceUrl: string | undefined, ...segments: string[]): string {
    return `/${[this.currentLanguage(sourceUrl), 'admin', ...segments].join('/')}`;
  }

  private currentLanguage(sourceUrl = this.router.url): string {
    return sourceUrl.startsWith('/fr') ? 'fr' : 'en';
  }
}
