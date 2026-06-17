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
        redirectTo: 'works',
        pathMatch: 'full',
      },

      {
        path: 'works',
        loadComponent: () =>
          import('./pages/works/works.component').then(
            m => m.WorksComponent
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
    ],
  },
];