import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
 {
  path: '',
  redirectTo: 'en',
  pathMatch: 'full',
},

{
  path: ':lang',
  children: [
    {
      path: '',
      loadComponent: () =>
        import('./pages/works/works.component').then(
          (m) => m.WorksComponent
        ),
    },
    {
      path: 'works',
      loadComponent: () =>
        import('./pages/works/works.component').then(
          (m) => m.WorksComponent
        ),
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
        import('./pages/about/about.component').then(
          (m) => m.AboutComponent
        ),
    },
    {
      path: 'contact',
      loadComponent: () =>
        import('./pages/contact/contact.component').then(
          (m) => m.ContactComponent
        ),
    },
  ],
},
];
