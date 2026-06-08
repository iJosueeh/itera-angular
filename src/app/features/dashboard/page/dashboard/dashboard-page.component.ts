import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DashboardContentService } from '@features/home/services/dashboard-content.service';
import { ProfileContentService } from '@features/profile/services/profile-content.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import { InteractiveRoadmapComponent } from '../../components/interactive-roadmap/interactive-roadmap.component';
import { DemandChartComponent, ChartDataPoint } from '@shared/ui/demand-chart/demand-chart.component';
import { StarRatingComponent } from '@shared/ui/star-rating/star-rating.component';
import { MarketApiService } from '@features/home/services/market-api.service';
import { AuthStorageService } from '@shared/services/auth-storage.service';
import { NavItem } from '@shared/interfaces/dashboard.interface';

@Component({
  selector: 'itera-dashboard-page',
  standalone: true,
  imports: [DashboardShellComponent, InteractiveRoadmapComponent, DemandChartComponent, StarRatingComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DashboardContentService, ProfileContentService],
})
export class DashboardPageComponent implements OnInit {
  private readonly dashboardContentService = inject(DashboardContentService);
  private readonly profileContentService = inject(ProfileContentService);
  private readonly marketApi = inject(MarketApiService);
  private readonly authStorage = inject(AuthStorageService);

  protected readonly vm = this.dashboardContentService.vm;
  protected readonly skills = this.dashboardContentService.marketSkills;
  protected readonly profile = this.profileContentService.profile;
  protected readonly matchScore = this.profileContentService.matchScore;
  
  protected readonly feedbackSent = signal(false);

  protected handleFeedback(rating: number): void {
    const userId = this.authStorage.getUserId() || 'anonymous';
    this.marketApi.sendFeedback({
      estudiante_id: userId,
      entidad_evaluada: 'MatchScore Analysis',
      calificacion_estrellas: rating,
      comentario: 'Submitted from Main Dashboard'
    }).subscribe(() => {
      this.feedbackSent.set(true);
    });
  }
  
  protected readonly demandData = computed<ChartDataPoint[]>(() => {
    const demand = this.dashboardContentService.marketDemand();
    if (!demand || !demand.salary_distribution) return [];
    return demand.salary_distribution.map((d: any) => ({
      label: d.range_usd,
      value: d.count
    }));
  });

  protected readonly skillDemandData = computed<ChartDataPoint[]>(() => {
    const demand = this.dashboardContentService.marketDemand();
    if (!demand || !demand.top_skills) return [];
    return demand.top_skills.map((d: any) => ({
      label: d.skill,
      value: d.demand_count
    }));
  });

  ngOnInit(): void {
    this.profileContentService.loadProfile();
  }

  protected readonly sidebarItems: ReadonlyArray<NavItem> = [
    { label: 'Dashboard', href: '/dashboard', icon: 'bi-grid-1x2', active: true },
    { label: 'Job Explorer', href: '/dashboard/jobs', icon: 'bi-search' },
    { label: 'Audit Monitor', href: '/dashboard/audit', icon: 'bi-shield-check' },
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
