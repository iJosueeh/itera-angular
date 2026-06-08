import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DashboardContentService } from '@features/home/services/dashboard-content.service';
import { ProfileContentService } from '@features/profile/services/profile-content.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
// ... (rest of imports)
import { NavItem } from '@shared/interfaces/dashboard.interface';

// ... (interfaces)

@Component({
  selector: 'itera-dashboard-progress-page',
  standalone: true,
  imports: [
    DashboardShellComponent,
    MasteryCardComponent,
    MentorAlertCardComponent,
    BadgeItemComponent,
    StatBarComponent,
  ],
  templateUrl: './progress-page.component.html',
  styleUrl: './progress-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DashboardContentService, ProfileContentService],
})
export class ProgressPageComponent implements OnInit {
  private readonly dashboardContentService = inject(DashboardContentService);
  private readonly profileContentService = inject(ProfileContentService);

  protected readonly vm = this.dashboardContentService.vm;
  protected readonly profile = this.profileContentService.profile;

  ngOnInit(): void {
    this.profileContentService.loadProfile();
  }

  protected readonly topNavItems: ReadonlyArray<NavItem> = [
    { label: 'Dashboard', href: '/dashboard', icon: 'bi-grid-1x2' },
    { label: 'Comparison', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Progress', href: '/dashboard/progress', icon: 'bi-graph-up-arrow', active: true },
  ];

  protected readonly sidebarItems: ReadonlyArray<NavItem> = [
    { label: 'Dashboard', href: '/dashboard', icon: 'bi-grid-1x2' },
    { label: 'Job Explorer', href: '/dashboard/jobs', icon: 'bi-search' },
    { label: 'Audit Monitor', href: '/dashboard/audit', icon: 'bi-shield-check' },
    { label: 'Demand', href: '/dashboard#demand', icon: 'bi-bar-chart-line' },
    { label: 'My Routes', href: '/dashboard#routes', icon: 'bi-signpost-2' },
    { label: 'Skills', href: '/dashboard#skills', icon: 'bi-stars' },
    { label: 'Comparison', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Progress', href: '/dashboard/progress', icon: 'bi-graph-up-arrow', active: true },
  ];

  protected readonly masteryCards: ReadonlyArray<MasteryCard> = [
    { title: 'Python Basics', subtitle: '4/5 Units Complete', progress: 85, tone: 'indigo' },
    { title: 'Pandas & NumPy', subtitle: '2/8 Units Complete', progress: 35, tone: 'emerald' },
    { title: 'Visualisation', subtitle: 'Locked Module', progress: 0, tone: 'violet' },
    { title: 'Deep Learning', subtitle: 'Locked Module', progress: 0, tone: 'indigo' },
  ];

  protected readonly badges: ReadonlyArray<BadgeItem> = [
    { label: 'Starter', icon: 'bi-award', earned: true },
    { label: 'Explorer', icon: 'bi-compass', earned: true },
    { label: 'Analyst', icon: 'bi-stars', earned: true },
    { label: 'Builder', icon: 'bi-box-seam', earned: false },
    { label: 'Mentor', icon: 'bi-lightbulb', earned: false },
    { label: 'Architect', icon: 'bi-diagram-3', earned: false },
    { label: 'Launch', icon: 'bi-rocket', earned: false },
    { label: 'Master', icon: 'bi-trophy', earned: false },
  ];

  protected readonly milestones: ReadonlyArray<MilestoneItem> = [
    { title: 'Master Decorators', meta: 'Estimated: 45 mins', status: 'completed' },
    { title: 'Error Handling Pro', meta: 'Locked until 01 is done', status: 'in-progress' },
    { title: 'Module Capstone', meta: 'Locked', status: 'locked' },
  ];
}
