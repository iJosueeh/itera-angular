import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DashboardContentService } from '@features/home/services/dashboard-content.service';
import { ProfileContentService } from '@features/profile/services/profile-content.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import { InteractiveRoadmapComponent } from '../../components/interactive-roadmap/interactive-roadmap.component';
import {
  DemandChartComponent,
  ChartDataPoint,
} from '@shared/ui/demand-chart/demand-chart.component';
import { StarRatingComponent } from '@shared/ui/star-rating/star-rating.component';
import { MarketApiService, SalaryByCareerResponse } from '@features/home/services/market-api.service';
import { AuthStorageService } from '@shared/services/auth-storage.service';
import { PageTelemetryService } from '@shared/services/page-telemetry.service';
import { NavItem } from '@shared/interfaces/dashboard.interface';
import { MatchResult } from '@shared/interfaces/market.interface';

@Component({
  selector: 'itera-dashboard-page',
  standalone: true,
  imports: [
    DashboardShellComponent,
    InteractiveRoadmapComponent,
    DemandChartComponent,
    StarRatingComponent,
    DecimalPipe,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private readonly dashboardContentService = inject(DashboardContentService);
  private readonly profileContentService = inject(ProfileContentService);
  private readonly marketApi = inject(MarketApiService);
  private readonly authStorage = inject(AuthStorageService);
  private readonly route = inject(ActivatedRoute);
  private readonly telemetry = inject(PageTelemetryService);

  protected readonly vm = this.dashboardContentService.vm;
  protected readonly skills = this.dashboardContentService.marketSkills;
  protected readonly profile = this.profileContentService.profile;
  protected readonly matchScore = this.profileContentService.matchScore;
  protected readonly currentTheme = this.profileContentService.currentTheme;

  protected readonly realMatchScore = signal<MatchResult | null>(null);
  protected readonly isEvaluating = signal(false);

  protected readonly displayScore = computed(() => {
    const real = this.realMatchScore();
    if (real) return real.score;
    return this.matchScore()?.score ?? 0;
  });

  protected readonly displayMissingSkills = computed(() => {
    const real = this.realMatchScore();
    if (real) return real.habilidades_faltantes;
    return this.matchScore()?.habilidades_faltantes ?? [];
  });

  protected readonly displayRecommendations = computed(() => {
    const real = this.realMatchScore();
    if (real) return real.recomendaciones;
    return this.matchScore()?.recomendaciones ?? [];
  });

  protected readonly matchedSkillCount = computed(() => {
    const profile = this.profile();
    const missing = this.displayMissingSkills();
    if (!profile?.skills) return 0;
    return Math.max(0, profile.skills.length - missing.length);
  });

  protected readonly skillsGapData = computed(() => {
    const missing = this.displayMissingSkills();
    const profile = this.profile();
    const matched = this.matchedSkillCount();
    const total = matched + missing.length;
    return { matched, missing: missing.length, total };
  });

  protected readonly demandData = computed<ChartDataPoint[]>(() => {
    const demand = this.dashboardContentService.marketDemand();
    if (!demand || !demand.salary_distribution) return [];
    return demand.salary_distribution.map((d: any) => ({
      label: d.range_usd,
      value: d.count,
    }));
  });

  protected readonly skillDemandData = computed<ChartDataPoint[]>(() => {
    const demand = this.dashboardContentService.marketDemand();
    if (!demand || !demand.top_skills) return [];
    return demand.top_skills.map((d: any) => ({
      label: d.skill,
      value: d.demand_count,
    }));
  });

  protected readonly availableGoals = [
    { id: 'General', label: 'General', icon: 'bi-grid' },
    { id: 'Backend', label: 'Backend', icon: 'bi-database' },
    { id: 'AI', label: 'IA & Data', icon: 'bi-cpu' },
    { id: 'Cloud', label: 'Cloud', icon: 'bi-cloud' },
    { id: 'Frontend', label: 'Frontend', icon: 'bi-window-sidebar' },
  ];

  protected updateGoal(goalId: string): void {
    this.profileContentService.updateAcademicGoal(goalId);
    // Re-evaluate match score after goal change
    setTimeout(() => this.evaluateMatch(), 500);
  }

  protected evaluateMatch(): void {
    const profile = this.profile();
    if (!profile?.skills?.length) return;

    this.isEvaluating.set(true);
    const studentSkills = profile.skills.map(s => s.name);
    const userId = this.authStorage.getUserId() || profile.userId;

    this.marketApi
      .evaluateMatch({ student_id: userId, skills: studentSkills })
      .subscribe({
        next: (result) => {
          this.realMatchScore.set(result);
          this.isEvaluating.set(false);
        },
        error: () => {
          this.isEvaluating.set(false);
        },
      });
  }

  protected readonly feedbackSent = signal(false);

  protected readonly salaryByCareer = signal<SalaryByCareerResponse | null>(null);

  protected readonly dynamicAvgSalary = computed(() => {
    const data = this.salaryByCareer();
    if (!data?.summary?.avg_salary_weighted) {
      const demand = this.dashboardContentService.marketDemand();
      if (!demand?.metrics?.offers_with_salary_data) return null;
      return null;
    }
    return data.summary.avg_salary_weighted;
  });

  protected readonly careerComparisonData = computed<ChartDataPoint[]>(() => {
    const data = this.salaryByCareer();
    if (!data?.careers?.length) return [];
    return data.careers
      .filter(c => c.salario_promedio > 0)
      .map(c => ({
        label: c.titulo_carrera,
        value: c.salario_promedio,
      }));
  });

  protected readonly topCareerDetails = computed(() => {
    const data = this.salaryByCareer();
    if (!data?.careers?.length) return [];
    return data.careers.slice(0, 4).map(c => ({
      title: c.titulo_carrera,
      avgSalary: c.salario_promedio,
      minSalary: c.salario_min,
      maxSalary: c.salario_max,
      volume: c.volumen_total,
      trend: c.tendencia,
      topSkills: c.habilidades_clave.slice(0, 3),
    }));
  });

  protected selectedCareer = signal<string | null>(null);

  protected handleChartDrillDown(point: ChartDataPoint): void {
    this.selectedCareer.set(point.label);
  }

  protected handleFeedback(rating: number): void {
    const userId = this.authStorage.getUserId() || 'guest';
    this.marketApi
      .sendFeedback({
        estudiante_id: userId,
        entidad_evaluada: 'MatchScore Analysis',
        calificacion_estrellas: rating,
        comentario: 'Submitted from Main Dashboard',
      })
      .subscribe(() => {
        this.feedbackSent.set(true);
      });
  }

  protected handleFeedbackWithComment(data: { rating: number; comment: string }): void {
    const userId = this.authStorage.getUserId() || 'guest';
    this.marketApi
      .sendFeedback({
        estudiante_id: userId,
        entidad_evaluada: 'MatchScore Analysis',
        calificacion_estrellas: data.rating,
        comentario: data.comment || undefined,
      })
      .subscribe(() => {
        this.feedbackSent.set(true);
        this.telemetry.trackInteraction('feedback_submitted', {
          rating: data.rating,
          has_comment: !!data.comment,
        });
      });
  }

  ngOnInit(): void {
    this.telemetry.startTracking('dashboard');

    this.profileContentService.loadProfile();

    // Load salary-by-career data for analytics
    this.marketApi.getSalaryByCareer().subscribe(data => {
      this.salaryByCareer.set(data);
    });

    // Evaluate real match score from Python backend
    this.evaluateMatch();

    // Read ?q= query param from URL and trigger career search if present
    const query = this.route.snapshot.queryParamMap.get('q');
    if (query) {
      this.dashboardContentService.getCareerSnapshot(query);
    }
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

  ngOnDestroy(): void {
    this.telemetry.stopTracking();
  }
}
