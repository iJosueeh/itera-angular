import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DashboardContentService } from '@features/home/services/dashboard-content.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import { InteractiveRoadmapComponent } from '../../components/interactive-roadmap/interactive-roadmap.component';
import { NavItem } from '@shared/interfaces/dashboard.interface';

@Component({
  selector: 'itera-dashboard-page',
  standalone: true,
  imports: [DashboardShellComponent, InteractiveRoadmapComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly dashboardContentService = inject(DashboardContentService);

  protected readonly vm = this.dashboardContentService.vm;

  protected readonly sidebarItems: ReadonlyArray<NavItem> = [
    { label: 'Dashboard', href: '/dashboard', icon: 'bi-grid-1x2', active: true },
    { label: 'Demand', href: '#demand', icon: 'bi-bar-chart-line' },
    { label: 'My Routes', href: '#routes', icon: 'bi-signpost-2' },
    { label: 'Skills', href: '#skills', icon: 'bi-stars' },
    { label: 'Comparison', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Progress', href: '/dashboard/progress', icon: 'bi-graph-up-arrow' },
  ];

  protected readonly topNavItems: ReadonlyArray<NavItem> = [
    { label: 'Dashboard', href: '/dashboard', icon: 'bi-grid-1x2', active: true },
    { label: 'Comparison', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Skills', href: '/dashboard#skills', icon: 'bi-stars' },
  ];
}
