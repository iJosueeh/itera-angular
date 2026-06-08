import { inject, Injectable, computed, signal } from '@angular/core';
import { Observable, take, map, catchError, of } from 'rxjs';
import { CareerSnapshot, DashboardViewModel } from '@shared/interfaces/dashboard.interface';
import { DashboardApiMockService } from './dashboard-api.mock.service';
import { MarketApiService } from './market-api.service';
import { DASHBOARD_MODEL_MOCK } from '../mocks/dashboard.mock';

@Injectable()
export class DashboardContentService {
  private readonly dashboardApiMockService = inject(DashboardApiMockService);
  private readonly marketApi = inject(MarketApiService);
  
  private readonly modelState = signal<DashboardViewModel | null>(null);
  readonly careerSnapshot = signal<CareerSnapshot | null>(null);
  readonly marketSkills = signal<MarketSkill[]>([]);
  readonly marketDemand = signal<any>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadDashboard();
  }

  readonly vm = computed(() => this.modelState() ?? DASHBOARD_MODEL_MOCK);

  getCareerSnapshot(query: string): void {
    // Attempt to find in existing metrics first, or just call search
    this.marketApi.getCareerMetrics().pipe(
      take(1),
      map(metrics => {
        const found = metrics.find(m => m.titulo_carrera.toLowerCase().includes(query.toLowerCase()));
        if (found) {
          return {
            career: found.titulo_carrera,
            annualSalaryUsd: `$${found.salario_anual_usd.mediana.toLocaleString()}`,
            demandLevel: found.demanda_mercado.nivel,
            marketGrowth: found.demanda_mercado.tendencia,
            learningRoute: 'View Roadmap',
            profileFit: `${found.analisis_competitivo.dificultad_entrada * 10}%`
          } as CareerSnapshot;
        }
        return null;
      }),
      catchError(() => of(null))
    ).subscribe((snapshot) => {
      if (snapshot) {
        this.careerSnapshot.set(snapshot);
      } else {
        // Fallback to mock for demo purposes if no real data yet
        this.dashboardApiMockService.getCareerSnapshot(query)
          .pipe(take(1))
          .subscribe(mock => this.careerSnapshot.set(mock));
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
    this.marketApi.getMarketSkills()
      .pipe(take(1), catchError(() => of([])))
      .subscribe(skills => this.marketSkills.set(skills));

    // Load market demand
    this.marketApi.getMarketDemand()
      .pipe(take(1), catchError(() => of(null)))
      .subscribe(demand => this.marketDemand.set(demand));
  }
}
