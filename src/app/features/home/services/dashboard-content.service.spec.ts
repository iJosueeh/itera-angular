import { TestBed } from '@angular/core/testing';
import { DashboardContentService } from './dashboard-content.service';
import { DashboardApiMockService } from './dashboard-api.mock.service';
import { MarketApiService } from './market-api.service';
import { of } from 'rxjs';
import { DASHBOARD_MODEL_MOCK } from '../mocks/dashboard.mock';
import { CareerSnapshot } from '@shared/interfaces/dashboard.interface';
import { CareerMetrics } from '@shared/interfaces/market.interface';

describe('DashboardContentService', () => {
  let service: DashboardContentService;
  let apiMockService: Partial<DashboardApiMockService>;
  let marketApiMock: Partial<MarketApiService>;

  beforeEach(() => {
    apiMockService = {
      getDashboardViewModel: () => of(DASHBOARD_MODEL_MOCK),
    };

    marketApiMock = {
      getCareerMetrics: () => of([
        {
          titulo_carrera: 'Cloud Architecture',
          salario_anual_usd: { min: 45000, max: 85000, promedio: 65000 },
          demanda_mercado: { volumen_total: 60, tendencia: 'creciente' },
          aprendizaje: { habilidades_clave: ['AWS', 'Docker'], tiempo_estimado_upgrading_meses: 6 },
          analisis_competitivo: { top_empresas: ['Google', 'AWS'] },
          ultima_actualizacion: new Date().toISOString()
        }
      ] as CareerMetrics[]),
      getMarketSkills: () => of([]),
      getMarketDemand: () => of(null)
    };

    TestBed.configureTestingModule({
      providers: [
        DashboardContentService,
        { provide: DashboardApiMockService, useValue: apiMockService },
        { provide: MarketApiService, useValue: marketApiMock }
      ],
    });
    service = TestBed.inject(DashboardContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial state loading then false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should provide the dashboard view model through vm()', () => {
    const vm = service.vm();
    expect(vm).toEqual(DASHBOARD_MODEL_MOCK);
    expect(vm.brand).toBe('Itera');
  });

  it('should update careerSnapshot signal when getCareerSnapshot is called', () => {
    service.getCareerSnapshot('Cloud');
    
    const snapshot = service.careerSnapshot();
    expect(snapshot).toBeTruthy();
    expect(snapshot?.career).toBe('Cloud Architecture');
    expect(snapshot?.demandLevel).toBe('Muy Alta');
  });
});
