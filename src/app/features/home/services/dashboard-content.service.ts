import { inject, Injectable, computed, signal, OnDestroy } from '@angular/core';
import { Observable, take, map, catchError, of, interval, Subject, takeUntil } from 'rxjs';
import { CareerSnapshot, CareerSearchResult, CareerSearchMatch, DashboardViewModel } from '@shared/interfaces/dashboard.interface';
import { MarketSkill, CareerMetrics, TopCompany, CareerCategory } from '@shared/interfaces/market.interface';
import { DashboardApiMockService } from './dashboard-api.mock.service';
import { MarketApiService } from './market-api.service';
import { DASHBOARD_MODEL_MOCK } from '../mocks/dashboard.mock';

/** Polling interval in ms (5 minutes) */
const POLL_INTERVAL_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class DashboardContentService implements OnDestroy {
  private readonly dashboardApiMockService = inject(DashboardApiMockService);
  private readonly marketApi = inject(MarketApiService);
  private readonly destroy$ = new Subject<void>();

  private readonly modelState = signal<DashboardViewModel | null>(null);
  readonly careerSnapshot = signal<CareerSnapshot | null>(null);
  readonly searchResults = signal<CareerSearchResult | null>(null);
  readonly selectedSearchMatch = signal<string | null>(null);
  readonly marketSkills = signal<MarketSkill[]>([]);
  readonly marketDemand = signal<any>(null);
  readonly careerMetrics = signal<CareerMetrics[]>([]);
  readonly topCompanies = signal<TopCompany[]>([]);
  readonly careerCategories = signal<CareerCategory[]>([]);
  readonly readinessScore = computed(() => {
    const demand = this.marketDemand();
    if (!demand || !demand.metrics) return 0;
    return Math.round((demand.metrics.total_offers_analyzed / 200) * 100);
  });
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly lastUpdated = signal<Date | null>(null);

  // Computed stats for trust indicators
  readonly totalOffers = computed(() => {
    const demand = this.marketDemand();
    return demand?.metrics?.total_offers_analyzed || 0;
  });

  readonly avgSalary = computed(() => {
    const careers = this.careerMetrics();
    if (!careers.length) return 0;
    const total = careers.reduce((sum, c) => sum + (c.salario_anual_usd?.promedio || 0), 0);
    return Math.round(total / careers.length);
  });

  readonly topCareers = computed(() => {
    return this.careerMetrics()
      .sort((a, b) => (b.demanda_mercado?.volumen_total || 0) - (a.demanda_mercado?.volumen_total || 0))
      .slice(0, 6);
  });

  constructor() {
    this.loadDashboard();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Force refresh all market data */
  refreshData(): void {
    this.loadMarketData();
  }

  readonly vm = computed(() => this.modelState() ?? DASHBOARD_MODEL_MOCK);

  /** Build a CareerSnapshot from metrics for a given career */
  private buildSnapshot(career: string, metrics?: CareerMetrics): CareerSnapshot {
    const volume = metrics?.demanda_mercado?.volumen_total || 0;
    let demandLabel = 'Estable';
    if (volume > 50) demandLabel = 'Muy Alta';
    else if (volume > 15) demandLabel = 'Media-Alta';
    else if (volume > 0) demandLabel = 'En Crecimiento';

    const isHighEnd =
      career.includes('IA') ||
      career.includes('Backend') ||
      career.includes('Cloud') ||
      career.includes('Datos') ||
      career.includes('Seguridad');
    const hasRealSalary =
      metrics?.salario_anual_usd && (metrics.salario_anual_usd.promedio || 0) > 0;
    const min = hasRealSalary
      ? metrics!.salario_anual_usd!.min
      : isHighEnd
        ? 42000
        : 30000;
    const max = hasRealSalary
      ? metrics!.salario_anual_usd!.max
      : isHighEnd
        ? 82000
        : 62000;

    return {
      career,
      annualSalaryUsd: `$${Math.floor(min / 1000)}k - $${Math.floor(max / 1000)}k`,
      growthYoY: `+${metrics?.demanda_mercado?.tendencia === 'creciente' ? '12' : '4'}% de crecimiento anual`,
      demandLevel: demandLabel,
      demandMomentum:
        metrics?.demanda_mercado?.tendencia === 'creciente'
          ? 'Alto impulso'
          : 'Mercado estable',
      profileFit: '64%',
      alignmentDescription: metrics
        ? 'Basado en las ofertas reales en base de datos'
        : 'Basado en datos del mercado tech',
    };
  }

  /** Search careers matching the query — returns multiple matches */
  searchCareers(query: string): void {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return;

    const matches: CareerSearchMatch[] = [];
    const metrics = this.careerMetrics();
    const categories = this.careerCategories();

    // 1. Search categories from taxonomy (always available)
    for (const cat of categories) {
      if (
        normalizedQuery.includes(cat.name.toLowerCase()) ||
        cat.name.toLowerCase().includes(normalizedQuery)
      ) {
        const m = metrics.find((m) => m.titulo_carrera === cat.name);
        if (m) {
          matches.push({
            category: cat.name,
            metrics: {
              annualSalaryUsd: m.salario_anual_usd,
              demandVolume: m.demanda_mercado?.volumen_total || 0,
              demandTrend: m.demanda_mercado?.tendencia || 'estable',
              topSkills: m.aprendizaje?.habilidades_clave?.slice(0, 3) || [],
            },
          });
        } else {
          matches.push({ category: cat.name });
        }
      }
    }

    // 2. Search skills in career metrics (e.g., "Python" → find careers that need Python)
    for (const m of metrics) {
      const alreadyAdded = matches.some((x) => x.category === m.titulo_carrera);
      if (alreadyAdded) continue;

      const skills = m.aprendizaje?.habilidades_clave || [];
      if (
        skills.some((s) => s.toLowerCase().includes(normalizedQuery)) ||
        m.titulo_carrera.toLowerCase().includes(normalizedQuery)
      ) {
        matches.push({
          category: m.titulo_carrera,
          metrics: {
            annualSalaryUsd: m.salario_anual_usd,
            demandVolume: m.demanda_mercado?.volumen_total || 0,
            demandTrend: m.demanda_mercado?.tendencia || 'estable',
            topSkills: skills.slice(0, 3),
          },
        });
      }
    }

    // 3. Build result
    if (matches.length > 0) {
      const firstMatch = matches[0];
      const matchingMetrics = metrics.find(
        (m) => m.titulo_carrera === firstMatch.category,
      );
      const snapshot = this.buildSnapshot(firstMatch.category, matchingMetrics);

      this.searchResults.set({ query, matches, snapshot });
      this.selectedSearchMatch.set(firstMatch.category);
      this.careerSnapshot.set(snapshot);
    } else {
      // Fallback — build a generic snapshot from the query
      this.searchResults.set({
        query,
        matches: [{ category: query.charAt(0).toUpperCase() + query.slice(1) }],
        snapshot: {
          career: query.charAt(0).toUpperCase() + query.slice(1),
          annualSalaryUsd: '$35k - $70k',
          growthYoY: '+20% de crecimiento anual',
          demandLevel: 'Media-Alta',
          demandMomentum: 'Mercado estable',
          profileFit: '64%',
          alignmentDescription: 'Basado en tus intereses y fortalezas actuales',
        },
      });
      this.selectedSearchMatch.set(query);
      this.careerSnapshot.set(this.searchResults()!.snapshot);
    }
  }

  /** Select a specific match from search results */
  selectSearchMatch(category: string): void {
    const results = this.searchResults();
    if (!results) return;

    const match = results.matches.find((m) => m.category === category);
    if (!match) return;

    const metrics = this.careerMetrics();
    const matchingMetrics = metrics.find((m) => m.titulo_carrera === category);
    const snapshot = this.buildSnapshot(category, matchingMetrics);

    this.selectedSearchMatch.set(category);
    this.careerSnapshot.set(snapshot);
  }

  /** Clear search results */
  clearSearch(): void {
    this.searchResults.set(null);
    this.selectedSearchMatch.set(null);
    this.careerSnapshot.set(null);
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Load static model
    this.dashboardApiMockService
      .getDashboardViewModel()
      .pipe(take(1))
      .subscribe({
        next: (model) => this.modelState.set(model),
        error: () => this.error.set('No pudimos cargar el dashboard.'),
        complete: () => this.isLoading.set(false),
      });

    // Load dynamic market data
    this.loadMarketData();
  }

  private loadMarketData(): void {
    // Load dynamic skills
    this.marketApi
      .getMarketSkills()
      .pipe(
        take(1),
        catchError(() => of([])),
      )
      .subscribe((skills) => this.marketSkills.set(skills));

    // Load market demand
    this.marketApi
      .getMarketDemand()
      .pipe(
        take(1),
        catchError(() => of(null)),
      )
      .subscribe((demand) => {
        this.marketDemand.set(demand);
        this.lastUpdated.set(new Date());
      });

    // Load career metrics for live data section
    this.marketApi
      .getCareerMetrics()
      .pipe(
        take(1),
        catchError(() => of([])),
      )
      .subscribe((careers) => this.careerMetrics.set(careers));

    // Load TOP companies (all tiers - legacy data is Tier 4)
    this.marketApi
      .getTopCompanies(4, 10)
      .pipe(
        take(1),
        catchError(() => of({ companies: [] })),
      )
      .subscribe((data) => this.topCompanies.set(data.companies || []));

    // Load career categories
    this.marketApi
      .getCareersCategories()
      .pipe(
        take(1),
        catchError(() => of({ categories: [] })),
      )
      .subscribe((data) => this.careerCategories.set(data.categories || []));
  }

  private startPolling(): void {
    interval(POLL_INTERVAL_MS)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadMarketData();
      });
  }
}
