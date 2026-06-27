import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DashboardContentService } from '@features/home/services/dashboard-content.service';
import { ProfileContentService } from '@features/profile/services/profile-content.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import { ComparisonComponent } from '../../components/comparison/comparison.component';
import {
  NavItem,
  DASHBOARD_SIDEBAR_ITEMS,
  DASHBOARD_TOP_NAV_ITEMS,
} from '@shared/interfaces/dashboard.interface';

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

protected readonly sidebarItems = DASHBOARD_SIDEBAR_ITEMS.map((item) => ({
    ...item,
    active: item.href === '/dashboard/comparison',
  }));

  protected readonly topNavItems = DASHBOARD_TOP_NAV_ITEMS;
}
