import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  effect,
  signal,
  computed,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { DashboardContentService } from '@features/home/services/dashboard-content.service';
import { ProfileContentService } from '@features/profile/services/profile-content.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import { InteractiveRoadmapComponent } from '../../components/interactive-roadmap/interactive-roadmap.component';
import {
  DemandChartComponent,
  ChartDataPoint,
} from '@shared/ui/demand-chart/demand-chart.component';
import { StarRatingComponent } from '@shared/ui/star-rating/star-rating.component';
import {
  MarketApiService,
  SalaryByCareerResponse,
  SalarySnapshotResponse,
} from '@features/home/services/market-api.service';
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
  private readonly router = inject(Router);
  private readonly telemetry = inject(PageTelemetryService);

  protected readonly vm = this.dashboardContentService.vm;
  protected readonly skills = this.dashboardContentService.marketSkills;
  protected readonly profile = this.profileContentService.profile;
  protected readonly matchScore = this.profileContentService.matchScore;
  protected readonly currentTheme = this.profileContentService.currentTheme;

  protected readonly realMatchScore = signal<MatchResult | null>(null);
  protected readonly isEvaluating = signal(false);
  protected readonly isUpdatingGoal = signal(false);

  // Track in-flight match evaluation to cancel race conditions
  private activeMatchSub: Subscription | null = null;

  // Loading states for skeleton rendering
  protected readonly isProfileLoading = this.profileContentService.isLoading;
  protected readonly isMatchLoading = computed(() => this.isEvaluating() || this.isGoalChanging());
  protected readonly isSkillsLoading = computed(
    () =>
      (this.skills().length === 0 && this.dashboardContentService.isLoading()) ||
      this.isGoalChanging(),
  );
  protected readonly isDemandLoading = computed(
    () => !this.dashboardContentService.marketDemand() && this.dashboardContentService.isLoading(),
  );

  private readonly isGoalChanging = signal(false);

  // Filter out generic skills like "Analista" from trending
  private static readonly GENERIC_SKILLS = new Set([
    'analista',
    'análisis',
    'office',
    'microsoft office',
    'excel',
    'comunicación',
    'devops',
  ]);
  protected readonly skillsTrending = computed(() => {
    const goalSkills = this.goalFilteredSkills();
    const useGoalFilter = this.isGoalFiltering() && goalSkills.length > 0;
    return this.skills()
      .filter((s) => !DashboardPageComponent.GENERIC_SKILLS.has(s.habilidad.toLowerCase()))
      .filter(
        (s) =>
          !useGoalFilter || goalSkills.some((g) => g.toLowerCase() === s.habilidad.toLowerCase()),
      )
      .slice(0, 3);
  });

  // Current goal's career category for filtering
  protected readonly currentGoalCategory = computed(() => {
    const goal = this.profile()?.academicGoal || 'General';
    const found = this.availableGoals.find((g) => g.id === goal);
    return found?.category;
  });

  // Career names to filter market charts by goal
  protected readonly goalCareerNames = computed(() => {
    const goal = this.profile()?.academicGoal || 'General';
    const found = this.availableGoals.find((g) => g.id === goal);
    return found?.careerNames ?? [];
  });

  // Whether a specific goal filter is active (not "General")
  protected readonly isGoalFiltering = computed(() => this.goalCareerNames().length > 0);

  // Goal-specific skills from career taxonomy whitelist
  private readonly goalFilteredSkills = computed(() => {
    const goal = this.profile()?.academicGoal || 'General';
    const whitelist = DashboardPageComponent.GOAL_SKILLS_WHITELIST[goal];
    if (!whitelist) return []; // General = no filter
    return whitelist;
  });

  protected readonly displayScore = computed(() => {
    const real = this.realMatchScore();
    if (real) return real.score;
    return this.matchScore()?.score ?? 0;
  });

  // Merges variant/lowercase names from the backend into canonical display names.
  // Keys are lowercase normalized forms from the API; values are the display version.
  // Example: "vue" and "vue.js" both map to "Vue.js" so they don't appear as duplicates.
  private static readonly SKILL_DISPLAY_NAMES: Record<string, string> = {
    vue: 'Vue.js',
    vuejs: 'Vue.js',
    reactjs: 'React',
    'react.js': 'React',
    angularjs: 'Angular',
    'angular.js': 'Angular',
    node: 'Node.js',
    nodejs: 'Node.js',
    rest: 'REST API',
    restful: 'REST API',
    'sql server': 'SQL Server',
    'spring boot': 'Spring Boot',
    spring: 'Spring Boot',
    'c#': 'C#',
    csharp: 'C#',
    '.net': '.NET',
    'html/css': 'HTML/CSS',
    html5: 'HTML/CSS',
    'next.js': 'Next.js',
    nextjs: 'Next.js',
    'tailwind css': 'Tailwind CSS',
    tailwind: 'Tailwind CSS',
    'd3.js': 'D3.js',
    'ci/cd': 'CI/CD',
    'github actions': 'GitHub Actions',
    'gitlab ci': 'GitLab CI',
    k8s: 'Kubernetes',
    gcp: 'Google Cloud',
    js: 'JavaScript',
    ts: 'TypeScript',
    pyspark: 'Spark',
    ml: 'Machine Learning',
    dl: 'Deep Learning',
    powerbi: 'Power BI',
    'scikit-learn': 'Scikit-learn',
    'react native': 'React Native',
  };

  protected readonly displayMissingSkills = computed(() => {
    const real = this.realMatchScore();
    if (real) {
      // Build canonical lookup: lowercase -> proper-cased name (from current goal whitelist)
      const goalSkills = this.goalFilteredSkills();
      const canonical = new Map<string, string>();
      for (const s of goalSkills) {
        canonical.set(s.toLowerCase(), s);
      }

      const seen = new Set<string>();
      const result: string[] = [];
      for (const skill of real.habilidades_faltantes) {
        const rawKey = skill.toLowerCase().trim();
        // Use SKILL_DISPLAY_NAMES as the dedup key so variants (e.g. "node"/"node.js")
        // collapse into a single entry instead of appearing as duplicates.
        const mappedKey =
          DashboardPageComponent.SKILL_DISPLAY_NAMES[rawKey]?.toLowerCase() || rawKey;
        if (!seen.has(mappedKey)) {
          seen.add(mappedKey);
          // Priority: 1) SKILL_DISPLAY_NAMES (explicit merge), 2) whitelist canonical, 3) simple capitalize
          const fromDisplayName = DashboardPageComponent.SKILL_DISPLAY_NAMES[rawKey];
          const fromWhitelist = canonical.get(rawKey);
          result.push(
            fromDisplayName || fromWhitelist || skill.charAt(0).toUpperCase() + skill.slice(1),
          );
        }
      }
      return result;
    }
    // Fallback to cached profile data when NOT evaluating (shows initial data
    // during the brief window before tryEvaluate fires).
    // Once evaluation starts, the skeleton takes over and this fallback is hidden.
    if (!this.isEvaluating()) {
      return this.matchScore()?.habilidades_faltantes ?? [];
    }
    return [];
  });

  protected readonly displayRecommendations = computed(() => {
    const real = this.realMatchScore();
    if (real) return real.recomendaciones;
    if (!this.isEvaluating()) {
      return this.matchScore()?.recomendaciones ?? [];
    }
    return [];
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
    const goalSkills = this.goalFilteredSkills();
    const useGoalFilter = this.isGoalFiltering() && goalSkills.length > 0;
    return demand.top_skills
      .filter(
        (d: any) =>
          !useGoalFilter || goalSkills.some((g) => g.toLowerCase() === d.skill.toLowerCase()),
      )
      .map((d: any) => ({
        label: d.skill,
        value: d.demand_count,
      }));
  });

  protected readonly availableGoals = [
    {
      id: 'General',
      label: 'General',
      icon: 'bi-grid',
      category: undefined as string | undefined,
      careerNames: [] as string[],
    },
    {
      id: 'Backend',
      label: 'Backend',
      icon: 'bi-database',
      category: 'desarrollo-backend',
      careerNames: ['Desarrollo Backend'] as string[],
    },
    {
      id: 'AI',
      label: 'IA & Data',
      icon: 'bi-cpu',
      category: 'ciencia-datos-ia',
      careerNames: [
        'Ciencia de Datos e IA',
        'Datos y Business Intelligence',
        'Ingeniería de Datos',
      ] as string[],
    },
    {
      id: 'Cloud',
      label: 'Cloud',
      icon: 'bi-cloud',
      category: 'devops-cloud',
      careerNames: [
        'Infraestructura y Cloud',
        'Infraestructura y Sistemas',
        'DevOps y Cloud',
      ] as string[],
    },
    {
      id: 'Frontend',
      label: 'Frontend',
      icon: 'bi-window-sidebar',
      category: 'desarrollo-frontend',
      careerNames: ['Desarrollo Frontend', 'Desarrollo Fullstack'] as string[],
    },
  ];

  // Canonical skills allowed per goal (based on career taxonomy keywords)
  private static readonly GOAL_SKILLS_WHITELIST: Record<string, string[]> = {
    Backend: [
      'Java',
      'Python',
      'Node',
      'Node.js',
      'SQL',
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'Docker',
      'Django',
      'Flask',
      'FastAPI',
      'Spring',
      'Spring Boot',
      'Laravel',
      'PHP',
      'Go',
      'C#',
      '.NET',
      'Git',
      'REST API',
      'Kubernetes',
      'Linux',
      'Oracle',
      'SQL Server',
    ],
    AI: [
      'Python',
      'Machine Learning',
      'Deep Learning',
      'SQL',
      'TensorFlow',
      'PyTorch',
      'Spark',
      'Airflow',
      'dbt',
      'Pandas',
      'NumPy',
      'Scikit-learn',
      'NLP',
      'AI Generativa',
      'Snowflake',
      'BigQuery',
      'Databricks',
      'ETL',
      'Data Warehouse',
      'Power BI',
      'Tableau',
      'R',
      'Docker',
      'AWS',
      'Azure',
      'PostgreSQL',
      'MongoDB',
    ],
    Cloud: [
      'AWS',
      'Azure',
      'Google Cloud',
      'Docker',
      'Kubernetes',
      'Terraform',
      'Ansible',
      'Jenkins',
      'GitHub Actions',
      'GitLab CI',
      'Linux',
      'Nginx',
      'Prometheus',
      'Grafana',
      'Helm',
      'CI/CD',
      'Git',
      'Python',
      'Bash/Shell',
      'CloudFormation',
      'Pulumi',
      'Serverless',
      'Vault',
      'Docker Swarm',
      'OpenShift',
    ],
    Frontend: [
      'React',
      'Angular',
      'Vue.js',
      'JavaScript',
      'TypeScript',
      'HTML/CSS',
      'Next.js',
      'Tailwind CSS',
      'Redux',
      'GraphQL',
      'REST API',
      'Svelte',
      'Node.js',
      'Python',
      'Git',
      'D3.js',
      'Bootstrap',
      'jQuery',
      'SQL',
      'PostgreSQL',
      'MongoDB',
    ],
  };

  protected async updateGoal(goalId: string): Promise<void> {
    if (this.isUpdatingGoal()) return;
    if (this.profile()?.academicGoal === goalId) return;

    this.isUpdatingGoal.set(true);
    this.isGoalChanging.set(true);
    this.isEvaluating.set(true);
    this.realMatchScore.set(null); // Clear old match data

    let calledEvaluateMatch = false;

    try {
      // 1. Update goal on backend — profileState is merged synchronously inside the service
      const updatedProfile = await firstValueFrom(
        this.profileContentService.updateAcademicGoal(goalId),
      );

      // 2. Use evaluateMatch() instead of a direct API call so that:
      //    - activeMatchSub properly cancels any in-flight evaluation from ngOnInit
      //    - Only ONE code path sets realMatchScore, avoiding race conditions
      const profileToUse = updatedProfile || this.profile();
      if (profileToUse) {
        calledEvaluateMatch = true;
        // Profile state is already updated with the new goal (service merges synchronously).
        // evaluateMatch() reads this.profile()?.academicGoal → correct category.
        // Skills can be empty — the API handles that gracefully.
        this.evaluateMatch();
      }
    } catch (err) {
      console.error('Error al actualizar goal o evaluar match:', err);
      this.isEvaluating.set(false);
    } finally {
      this.isUpdatingGoal.set(false);
      this.isGoalChanging.set(false);
      // Only reset isEvaluating here if evaluateMatch() was NOT called,
      // because evaluateMatch() handles its own isEvaluating state via the subscription callbacks.
      if (!calledEvaluateMatch) {
        this.isEvaluating.set(false);
      }
    }
  }

  protected continueLearning(): void {
    this.router.navigate(['/dashboard/progress']);
  }

  protected evaluateMatch(): void {
    const profile = this.profile();
    // Profile is needed (skills can be empty — the API handles that gracefully)
    if (!profile) return;

    // Cancel any in-flight evaluation to prevent race conditions
    // (ngOnInit's initial call must not overwrite a goal-specific result)
    this.activeMatchSub?.unsubscribe();

    this.isEvaluating.set(true);
    const studentSkills = (profile.skills || []).map((s) => s.name);
    const userId = this.authStorage.getUserId() || profile.userId;
    const category = this.currentGoalCategory();

    console.log(
      `[Match] evaluateMatch → goal: "${profile.academicGoal}", category: "${category}", skills(${studentSkills.length}): [${studentSkills.join(', ')}]`,
    );

    this.activeMatchSub = this.marketApi
      .evaluateMatch({ student_id: userId, skills: studentSkills, career_category: category })
      .subscribe({
        next: (result) => {
          console.log(
            `[Match] API response → score: ${result.score}, missing(${result.habilidades_faltantes.length}): [${result.habilidades_faltantes.join(', ')}]`,
          );
          this.realMatchScore.set(result);
          this.isEvaluating.set(false);
        },
        error: (err) => {
          console.error('[Match] API error:', err);
          this.isEvaluating.set(false);
        },
      });
  }

  protected readonly feedbackSent = signal(false);

  protected readonly salaryByCareer = signal<SalaryByCareerResponse | null>(null);

  protected readonly salarySnapshots = signal<SalarySnapshotResponse | null>(null);

  protected readonly selectedYear = signal<number | null>(null);

  protected readonly isSalaryLoading = signal(false);

  protected readonly availableYears = computed(() => {
    return this.salarySnapshots()?.available_years ?? [];
  });

  protected readonly isHistoricalMode = computed(() => {
    return this.selectedYear() !== null && this.availableYears().length > 0;
  });

  protected readonly dynamicAvgSalary = computed(() => {
    const data = this.salaryByCareer();
    const goalNames = this.goalCareerNames();
    if (!data?.careers?.length) return null;

    // If filtering by goal, compute avg from matching careers only
    if (goalNames.length > 0 && data.careers.length > 0) {
      const matching = data.careers.filter((c) => goalNames.includes(c.titulo_carrera));
      if (matching.length > 0) {
        const totalW = matching.reduce((sum, c) => sum + (c.salario_promedio || 0), 0);
        return Math.round(totalW / matching.length);
      }
      return null;
    }

    if (!data?.summary?.avg_salary_weighted) return null;
    return data.summary.avg_salary_weighted;
  });

  protected readonly careerComparisonData = computed<ChartDataPoint[]>(() => {
    const year = this.selectedYear();
    const snapshots = this.salarySnapshots();
    const goalNames = this.goalCareerNames();

    // Historical mode: use snapshot data for selected year
    if (year !== null && snapshots?.snapshots) {
      const result: ChartDataPoint[] = [];
      for (const [careerName, yearData] of Object.entries(snapshots.snapshots)) {
        // Find data for selected year
        const yearEntry = yearData.find((y) => y.year === year);
        if (!yearEntry) continue;
        if (goalNames.length > 0 && !goalNames.includes(careerName)) continue;

        const shortLabel = this.shortenCareerName(careerName);
        const formattedValue = this.formatSalary(yearEntry.salario_promedio);
        result.push({
          label: `${shortLabel} ${year}`,
          value: yearEntry.salario_promedio,
          metadata: {
            fullLabel: `${careerName} (${year})`,
            formattedValue,
            minSalary: yearEntry.salario_min,
            maxSalary: yearEntry.salario_max,
            volume: yearEntry.volumen_total,
            trend: undefined,
          },
        });
      }
      return result.sort((a, b) => b.value - a.value);
    }

    // Current mode: use salary-by-career data
    const data = this.salaryByCareer();
    if (!data?.careers?.length) return [];
    let careers = data.careers.filter((c) => c.salario_promedio > 0);
    if (goalNames.length > 0) {
      careers = careers.filter((c) => goalNames.includes(c.titulo_carrera));
    }
    return careers.map((c) => {
      const shortLabel = this.shortenCareerName(c.titulo_carrera);
      const formattedValue = this.formatSalary(c.salario_promedio);
      return {
        label: shortLabel,
        value: c.salario_promedio,
        metadata: {
          fullLabel: c.titulo_carrera,
          formattedValue,
          minSalary: c.salario_min,
          maxSalary: c.salario_max,
          volume: c.volumen_total,
          trend: c.tendencia,
        },
      };
    });
  });

  private shortenCareerName(name: string): string {
    const mapping: Record<string, string> = {
      'Desarrollo Backend': 'Backend',
      'Desarrollo Frontend': 'Frontend',
      'Desarrollo Fullstack': 'Fullstack',
      'Ciencia de Datos e IA': 'Data & IA',
      'Datos y Business Intelligence': 'BI & Analytics',
      'Ingeniería de Datos': 'Data Eng',
      'Infraestructura y Cloud': 'Cloud',
      'Infraestructura y Sistemas': 'Infra',
      'DevOps y Cloud': 'DevOps',
    };
    return mapping[name] || name;
  }

  private formatSalary(value: number): string {
    if (value >= 1000) {
      return `$${Math.round(value / 1000)}k`;
    }
    return `$${value}`;
  }

  protected readonly topCareerDetails = computed(() => {
    const data = this.salaryByCareer();
    const goalNames = this.goalCareerNames();
    if (!data?.careers?.length) return [];
    let careers = data.careers;
    if (goalNames.length > 0) {
      careers = careers.filter((c) => goalNames.includes(c.titulo_carrera));
    }
    return careers.slice(0, 4).map((c) => ({
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
    // Use fullLabel from metadata if available (shortened labels for chart display)
    this.selectedCareer.set(point.metadata?.fullLabel || point.label);
  }

  protected selectYear(year: number | null): void {
    if (this.selectedYear() === year) return;
    this.isSalaryLoading.set(true);
    // Brief delay to show skeleton during transition
    setTimeout(() => {
      this.selectedYear.set(year);
      this.isSalaryLoading.set(false);
    }, 150);
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

  private readonly initialMatchEvaluated = signal(false);

  constructor() {
    // Reactively fire the initial match evaluation once the profile signal becomes available.
    // This is more reliable than setTimeout polling because it fires as soon as the
    // profile data arrives, regardless of network latency.
    effect(() => {
      // Track these signals so the effect re-runs when they change
      const p = this.profile();
      const inProgress = this.isUpdatingGoal();

      // Only fire once: profile must be loaded, no goal change in progress,
      // and we haven't evaluated yet.
      if (!p || inProgress || this.initialMatchEvaluated()) return;

      console.log(
        `[Match] Initial evaluate → profile.academicGoal: "${p.academicGoal}", category: "${this.currentGoalCategory()}"`,
      );
      this.initialMatchEvaluated.set(true);
      this.evaluateMatch();
    });
  }

  ngOnInit(): void {
    this.telemetry.startTracking('dashboard');

    this.profileContentService.loadProfile();

    // Load salary-by-career data for analytics
    this.marketApi.getSalaryByCareer().subscribe((data) => {
      this.salaryByCareer.set(data);
    });

    // Load salary snapshots for historical comparison
    this.marketApi.getSalarySnapshots().subscribe((data) => {
      this.salarySnapshots.set(data);
      // Auto-select most recent year if snapshots available
      if (data.available_years.length > 0) {
        this.selectedYear.set(data.available_years[0]);
      }
    });

    // Read ?q= query param from URL and trigger career search if present
    const query = this.route.snapshot.queryParamMap.get('q');
    if (query) {
      this.dashboardContentService.searchCareers(query);
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
    { label: 'Mi Perfil', href: '/dashboard/profile', icon: 'bi-person' },
  ];

  protected readonly topNavItems: ReadonlyArray<NavItem> = [
    { label: 'Panel', href: '/dashboard', icon: 'bi-grid-1x2', active: true },
    { label: 'Comparación', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Habilidades', href: '/dashboard', fragment: 'skills', icon: 'bi-stars' },
  ];

  ngOnDestroy(): void {
    this.activeMatchSub?.unsubscribe();
    this.telemetry.stopTracking();
  }
}
