import { NavItem } from '@shared/interfaces/dashboard.interface';

export const NAV_ITEMS_MOCK: ReadonlyArray<NavItem> = [
  { label: 'Inicio', href: '/', icon: 'bi-house-door', active: true },
  { label: 'Dashboard', href: '/dashboard', icon: 'bi-grid-1x2' },
  { label: 'Entrar', href: '/auth/login', icon: 'bi-box-arrow-in-right' },
  { label: 'Registrar', href: '/auth/register', icon: 'bi-person-plus' },
];

export const BRAND_MOCK = 'Itera';
