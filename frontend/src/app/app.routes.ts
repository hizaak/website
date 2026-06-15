import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'works',
    pathMatch: 'full',
  },
  {
    path: 'works',
    loadComponent: () =>
      import('./pages/works/works.component').then((m) => m.WorksComponent),
  },
  {
    path: 'works/:id',
    loadComponent: () =>
      import('./pages/works/work-detail.component').then(
        (m) => m.WorkDetailComponent
      ),
  },
  {
    path: 'photos/:id',
    loadComponent: () =>
      import('./pages/photos/photo-detail.component').then(
        (m) => m.PhotoDetailComponent
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/auth/admin.component').then(
        (m) => m.AdminComponent
      ),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/admin/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'works',
        loadComponent: () =>
          import('./pages/admin/dashboard/works/works-admin.component').then(
            (m) => m.WorksAdminComponent
          ),
      },
      {
        path: 'works/:id',
        loadComponent: () =>
          import('./pages/admin/dashboard/works/work-detail-admin.component').then(
            (m) => m.WorkDetailAdminComponent
          ),
      },
      {
        path: 'works/:workId/photos/:photoId',
        loadComponent: () =>
          import('./pages/admin/dashboard/works/photo-detail-admin.component').then(
            (m) => m.PhotoDetailAdminComponent
          ),
      },
      {
        path: '',
        redirectTo: 'works',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'works',
    pathMatch: 'full',
  },
];
