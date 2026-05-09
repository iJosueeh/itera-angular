import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DashboardContentService } from '../../../home/services/dashboard-content.service';
import { DashboardShellComponent } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { ComparisonComponent } from '../../components/comparison/comparison.component';
import { NavItem } from '../../../../shared/interfaces/dashboard.interface';

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

  protected readonly vm = this.dashboardContentService.vm;

  protected readonly sidebarItems: ReadonlyArray<NavItem> = [
    { label: 'Dashboard', href: '/dashboard', icon: 'bi-grid-1x2' },
    { label: 'My Routes', href: '/dashboard#routes', icon: 'bi-signpost-2' },
    { label: 'Skills', href: '/dashboard#skills', icon: 'bi-stars' },
    {
      label: 'Comparison',
      href: '/dashboard/comparison',
      icon: 'bi-arrow-left-right',
      active: true,
    },
    { label: 'Progress', href: '/dashboard/progress', icon: 'bi-graph-up-arrow' },
  ];

  protected readonly topNavItems: ReadonlyArray<NavItem> = [
    { label: 'Dashboard', href: '/dashboard', icon: 'bi-grid-1x2' },
    {
      label: 'Comparison',
      href: '/dashboard/comparison',
      icon: 'bi-arrow-left-right',
      active: true,
    },
    { label: 'Skills', href: '/dashboard#skills', icon: 'bi-stars' },
  ];
}
