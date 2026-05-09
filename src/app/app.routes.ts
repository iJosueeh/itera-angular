import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./features/home/home-page.component').then(
				(m) => m.HomePageComponent
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
		loadComponent: () =>
			import('./features/dashboard/page/dashboard/dashboard-page.component').then(
				(m) => m.DashboardPageComponent
			)
	},
	{
		path: 'dashboard/comparison',
		loadComponent: () =>
			import('./features/dashboard/page/comparison/comparison-page.component').then(
				(m) => m.ComparisonPageComponent
			)
	},
	{
		path: 'dashboard/progress',
		loadComponent: () =>
			import('./features/dashboard/page/progress/progress-page.component').then(
				(m) => m.ProgressPageComponent
			)
	},
	{
		path: '**',
		loadComponent: () =>
			import('./shared/components/not-found-page/not-found-page.component').then(
				(m) => m.NotFoundPageComponent
			)
	}
];
