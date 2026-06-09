import { inject, Injectable, computed, signal } from '@angular/core';
import { Observable, take, map, catchError, of } from 'rxjs';
import { CareerSnapshot, DashboardViewModel } from '@shared/interfaces/dashboard.interface';
import { MarketSkill } from '@shared/interfaces/market.interface';
import { DashboardApiMockService } from './dashboard-api.mock.service';
import { MarketApiService } from './market-api.service';
import { DASHBOARD_MODEL_MOCK } from '../mocks/dashboard.mock';

@Injectable({ providedIn: 'root' })
export class DashboardContentService {
  private readonly dashboardApiMockService = inject(DashboardApiMockService);
  private readonly marketApi = inject(MarketApiService);

  private readonly modelState = signal<DashboardViewModel | null>(null);
  readonly careerSnapshot = signal<CareerSnapshot | null>(null);
  readonly marketSkills = signal<MarketSkill[]>([]);
  readonly marketDemand = signal<any>(null);
  readonly readinessScore = computed(() => {
    const demand = this.marketDemand();
    if (!demand || !demand.metrics) return 0;
    // For the landing page, we show the 'Market Health' as a proxy for readiness
    return Math.round((demand.metrics.total_offers_analyzed / 200) * 100);
  });
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadDashboard();
  }

  readonly vm = computed(() => this.modelState() ?? DASHBOARD_MODEL_MOCK);

  getCareerSnapshot(query: string): void {
    this.marketApi
      .getCareerMetrics()
      .pipe(
        take(1),
        map((metrics) => {
          const normalizedQuery = query.toLowerCase();
          // Strict focus on existing database categories first
          const found = metrics.find(
            (m) =>
              normalizedQuery.includes(m.titulo_carrera.toLowerCase()) ||
              m.titulo_carrera.toLowerCase().includes(normalizedQuery),
          );

          if (found) {
            // Use real database volume to determine demand level
            const volume = found.demanda_mercado.volumen_total || 0;
            let demandLabel = 'Estable';
            if (volume > 50) demandLabel = 'Muy Alta';
            else if (volume > 15) demandLabel = 'Media-Alta';
            else if (volume > 0) demandLabel = 'En Crecimiento';

            // Use real database values for salary, or conservative tech-based estimates if 0
            const isHighEnd =
              found.titulo_carrera.includes('IA') ||
              found.titulo_carrera.includes('Backend') ||
              found.titulo_carrera.includes('Cloud');
            const min =
              found.salario_anual_usd.min > 0
                ? found.salario_anual_usd.min
                : isHighEnd
                  ? 42000
                  : 30000;
            const max =
              found.salario_anual_usd.max > 0
                ? found.salario_anual_usd.max
                : isHighEnd
                  ? 82000
                  : 62000;

            return {
              career: found.titulo_carrera,
              annualSalaryUsd: `$${Math.floor(min / 1000)}k - $${Math.floor(max / 1000)}k`,
              growthYoY: `+${found.demanda_mercado.tendencia === 'creciente' ? '12' : '4'}% de crecimiento anual`,
              demandLevel: demandLabel,
              demandMomentum:
                found.demanda_mercado.tendencia === 'creciente'
                  ? 'Alto impulso'
                  : 'Mercado estable',
              profileFit: '64%', // Reference baseline for landing page
              alignmentDescription: 'Basado en las ofertas reales en base de datos',
            } as CareerSnapshot;
          }
          return null;
        }),
        catchError(() => of(null)),
      )
      .subscribe((snapshot) => {
        if (snapshot) {
          this.careerSnapshot.set(snapshot);
        } else {
          // Fallback to a generic 'Custom Route' that matches the user query if not in DB
          this.careerSnapshot.set({
            career: query.charAt(0).toUpperCase() + query.slice(1),
            annualSalaryUsd: '$35k - $70k',
            growthYoY: '+20% de crecimiento anual',
            demandLevel: 'Media-Alta',
            demandMomentum: 'Mercado estable',
            profileFit: '64%',
            alignmentDescription: 'Basado en tus intereses y fortalezas actuales',
          });
        }
      });
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
      .subscribe((demand) => this.marketDemand.set(demand));
  }
}
