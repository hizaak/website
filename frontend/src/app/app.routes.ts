import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AdminRedirectGuard } from './guards/admin-redirect.guard';

const localizedRoutes: Routes = [
  {
    path: '',
    redirectTo: 'works',
    pathMatch: 'full',
  },

  {
    path: 'admin/auth',
    canActivate: [NoAuthGuard],
    loadComponent: () =>
      import('./pages/admin/auth/admin.component').then(
        m => m.AdminComponent
      ),
  },

  {
    path: 'admin',
    pathMatch: 'full',
    canActivate: [AdminRedirectGuard],
    loadComponent: () =>
      import('./pages/admin/auth/admin.component').then(
        m => m.AdminComponent
      ),
  },

  {
    path: 'admin/works',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/admin/works/works-admin.component')
        .then(m => m.WorksAdminComponent),
  },

  {
    path: 'admin/works/:workId',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/admin/works/work-detail-admin.component')
        .then(m => m.WorkDetailAdminComponent),
  },
  {
    path: 'works',
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
    loadComponent: () =>
      import('./pages/about/about.component').then(
        m => m.AboutComponent
      ),
  },

  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        m => m.ContactComponent
      ),
  },
];

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'en/works',
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
    redirectTo: 'en/works',
  },
];
