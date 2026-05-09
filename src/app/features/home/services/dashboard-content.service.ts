import { inject, Injectable, computed, signal } from '@angular/core';
import { Observable, take } from 'rxjs';
import { CareerSnapshot, DashboardViewModel } from '../../../shared/interfaces/dashboard.interface';
import { DashboardApiMockService } from './dashboard-api.mock.service';
import { DASHBOARD_MODEL_MOCK } from '../mocks/dashboard.mock';

@Injectable({ providedIn: 'root' })
export class DashboardContentService {
  private readonly dashboardApiMockService = inject(DashboardApiMockService);
  private readonly modelState = signal<DashboardViewModel | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadDashboard();
  }

  readonly vm = computed(() => this.modelState() ?? DASHBOARD_MODEL_MOCK);

  getCareerSnapshot(query: string): Observable<CareerSnapshot> {
    return this.dashboardApiMockService.getCareerSnapshot(query);
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardApiMockService
      .getDashboardViewModel()
      .pipe(take(1))
      .subscribe({
        next: (model) => {
          this.modelState.set(model);
        },
        error: () => {
          this.error.set('No pudimos cargar el dashboard. Intenta nuevamente.');
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
  }
}
