import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { guestGuard } from './shared/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'auth/register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register-page.component').then(
        (m) => m.RegisterPageComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/page/dashboard/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: 'dashboard/comparison',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/page/comparison/comparison-page.component').then(
        (m) => m.ComparisonPageComponent,
      ),
  },
  {
    path: 'dashboard/progress',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/page/progress/progress-page.component').then(
        (m) => m.ProgressPageComponent,
      ),
  },
  {
    path: 'dashboard/jobs',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/page/job-explorer/job-explorer-page.component').then(
        (m) => m.JobExplorerPageComponent,
      ),
  },
  {
    path: 'dashboard/audit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/page/audit-monitor/audit-monitor-page.component').then(
        (m) => m.AuditMonitorPageComponent,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
  },
];
