import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard'; // Le guard pour l'accès au dashboard
import { NoAuthGuard } from './guards/no-auth.guard'; // Le guard pour empêcher l'accès à auth quand déjà connecté

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./pages/gallery/gallery.component').then(
        (m) => m.GalleryComponent
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./pages/blog/blog.component').then((m) => m.BlogComponent),
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
        path: 'series',
        loadComponent: () =>
          import('./pages/admin/dashboard/series/series.component').then(
            (m) => m.SeriesComponent
          ),
      },
      {
        path: 'photos',
        loadComponent: () =>
          import('./pages/admin/dashboard/photos/photos.component').then(
            (m) => m.PhotosComponent
          ),
      },
      {
        path: '',
        redirectTo: 'series',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
