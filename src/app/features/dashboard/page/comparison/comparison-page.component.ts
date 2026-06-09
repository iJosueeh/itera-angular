import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DashboardContentService } from '@features/home/services/dashboard-content.service';
import { ProfileContentService } from '@features/profile/services/profile-content.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import { ComparisonComponent } from '../../components/comparison/comparison.component';
import { NavItem } from '@shared/interfaces/dashboard.interface';

@Component({
  selector: 'itera-dashboard-comparison-page',
  standalone: true,
  imports: [DashboardShellComponent, ComparisonComponent],
  templateUrl: './comparison-page.component.html',
  styleUrl: './comparison-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparisonPageComponent {
  private readonly dashboardContentService = inject(DashboardContentService);
  private readonly profileContentService = inject(ProfileContentService);

  protected readonly vm = this.dashboardContentService.vm;
  protected readonly currentTheme = this.profileContentService.currentTheme;

  protected readonly sidebarItems: ReadonlyArray<NavItem> = [
    { label: 'Panel', href: '/dashboard', icon: 'bi-grid-1x2' },
    { label: 'Explorador de Empleos', href: '/dashboard/jobs', icon: 'bi-search' },
    { label: 'Monitor de Auditoría', href: '/dashboard/audit', icon: 'bi-shield-check' },
    { label: 'Mis Rutas', href: '/dashboard', fragment: 'routes', icon: 'bi-signpost-2' },
    { label: 'Habilidades', href: '/dashboard', fragment: 'skills', icon: 'bi-stars' },
    {
      label: 'Comparación',
      href: '/dashboard/comparison',
      icon: 'bi-arrow-left-right',
      active: true,
    },
    { label: 'Progreso', href: '/dashboard/progress', icon: 'bi-graph-up-arrow' },
  ];

  protected readonly topNavItems: ReadonlyArray<NavItem> = [
    { label: 'Panel', href: '/dashboard', icon: 'bi-grid-1x2' },
    {
      label: 'Comparación',
      href: '/dashboard/comparison',
      icon: 'bi-arrow-left-right',
      active: true,
    },
    { label: 'Habilidades', href: '/dashboard', fragment: 'skills', icon: 'bi-stars' },
  ];
}
