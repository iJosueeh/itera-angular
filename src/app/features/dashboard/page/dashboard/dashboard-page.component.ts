import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
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
  protected readonly currentTheme = this.profileContentService.currentTheme;
  
  protected readonly availableGoals = [
    { id: 'General', label: 'General', icon: 'bi-grid' },
    { id: 'Backend', label: 'Backend', icon: 'bi-database' },
    { id: 'AI', label: 'IA & Data', icon: 'bi-cpu' },
    { id: 'Cloud', label: 'Cloud', icon: 'bi-cloud' },
    { id: 'Frontend', label: 'Frontend', icon: 'bi-window-sidebar' },
  ];

  protected updateGoal(goalId: string): void {
    this.profileContentService.updateAcademicGoal(goalId);
  }

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
    { label: 'Panel', href: '/dashboard', icon: 'bi-grid-1x2', active: true },
    { label: 'Explorador de Empleos', href: '/dashboard/jobs', icon: 'bi-search' },
    { label: 'Monitor de Auditoría', href: '/dashboard/audit', icon: 'bi-shield-check' },
    { label: 'Demanda', href: '/dashboard', fragment: 'demand', icon: 'bi-bar-chart-line' },
    { label: 'Mis Rutas', href: '/dashboard', fragment: 'routes', icon: 'bi-signpost-2' },
    { label: 'Habilidades', href: '/dashboard', fragment: 'skills', icon: 'bi-stars' },
    { label: 'Comparación', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Progreso', href: '/dashboard/progress', icon: 'bi-graph-up-arrow' },
  ];

  protected readonly topNavItems: ReadonlyArray<NavItem> = [
    { label: 'Panel', href: '/dashboard', icon: 'bi-grid-1x2', active: true },
    { label: 'Comparación', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Habilidades', href: '/dashboard', fragment: 'skills', icon: 'bi-stars' },
  ];
}
