import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AdminRedirectGuard } from './guards/admin-redirect.guard';
import { detectBrowserLanguage } from './core/language.service';

const redirectToDefaultLanguage = () => `${detectBrowserLanguage()}/works`;

const localizedRoutes: Routes = [
  {
    path: '',
    redirectTo: 'works',
    pathMatch: 'full',
  },

  {
    path: 'admin/auth',
    data: { seo: { title: 'seo.admin.title', noindex: true } },
    canActivate: [NoAuthGuard],
    loadComponent: () =>
      import('./pages/admin/auth/admin.component').then(
        m => m.AdminComponent
      ),
  },

  {
    path: 'admin',
    data: { seo: { title: 'seo.admin.title', noindex: true } },
    pathMatch: 'full',
    canActivate: [AdminRedirectGuard],
    loadComponent: () =>
      import('./pages/admin/auth/admin.component').then(
        m => m.AdminComponent
      ),
  },

  {
    path: 'admin/works',
    data: { seo: { title: 'seo.admin.title', noindex: true } },
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/admin/works/works-admin.component')
        .then(m => m.WorksAdminComponent),
  },

  {
    path: 'admin/works/:workId',
    data: { seo: { title: 'seo.admin.title', noindex: true } },
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/admin/works/work-detail-admin.component')
        .then(m => m.WorkDetailAdminComponent),
  },

  {
    path: 'admin/documents',
    data: { seo: { title: 'seo.admin.title', noindex: true } },
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/admin/documents/documents-admin.component')
        .then(m => m.DocumentsAdminComponent),
  },
  {
    path: 'admin/account',
    data: { seo: { title: 'seo.admin.title', noindex: true } },
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/admin/account/account-admin.component')
        .then(m => m.AccountAdminComponent),
  },
  {
    path: 'works',
    data: { seo: { title: 'seo.works.title', description: 'seo.works.description' } },
    loadComponent: () =>
      import('./pages/works/works.component').then(
        m => m.WorksComponent
      ),
  },

  {
    path: 'works/:id/:photoIndex',
    loadComponent: () =>
      import('./pages/works/work.component').then(
        m => m.WorkComponent
      ),
  },

  {
    path: 'works/:id',
    loadComponent: () =>
      import('./pages/works/work.component').then(
        m => m.WorkComponent
      ),
  },

  {
    path: 'about',
    data: { seo: { title: 'seo.about.title', description: 'seo.about.description' } },
    loadComponent: () =>
      import('./pages/about/about.component').then(
        m => m.AboutComponent
      ),
  },

  {
    path: 'contact',
    data: { seo: { title: 'seo.contact.title', description: 'seo.contact.description' } },
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        m => m.ContactComponent
      ),
  },
];

export const routes: Routes = [
  {
    path: '',
    redirectTo: redirectToDefaultLanguage,
    pathMatch: 'full',
  },

  {
    path: 'fr',
    children: localizedRoutes,
  },

  {
    path: 'en',
    children: localizedRoutes,
  },

  {
    path: '**',
    redirectTo: redirectToDefaultLanguage,
  },
];
