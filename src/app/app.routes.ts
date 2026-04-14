import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./features/dashboard/dashboard-page.component').then(
				(m) => m.DashboardPageComponent
			)
	},
	{
		path: 'auth/login',
		loadComponent: () =>
			import('./features/auth/login/login-page.component').then(
				(m) => m.LoginPageComponent
			)
	},
	{
		path: 'auth/register',
		loadComponent: () =>
			import('./features/auth/register/register-page.component').then(
				(m) => m.RegisterPageComponent
			)
	},
	{
		path: 'dashboard',
		redirectTo: '',
		pathMatch: 'full'
	},
	{
		path: '**',
		loadComponent: () =>
			import('./shared/components/not-found-page/not-found-page.component').then(
				(m) => m.NotFoundPageComponent
			)
	}
];
