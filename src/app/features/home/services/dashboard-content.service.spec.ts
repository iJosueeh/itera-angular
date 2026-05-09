import { TestBed } from '@angular/core/testing';
import { DashboardContentService } from './dashboard-content.service';
import { DashboardApiMockService } from './dashboard-api.mock.service';
import { of } from 'rxjs';
import { DASHBOARD_MODEL_MOCK } from '../mocks/dashboard.mock';

import { CareerSnapshot } from '@shared/interfaces/dashboard.interface';

describe('DashboardContentService', () => {
  let service: DashboardContentService;
  let apiMockService: Partial<DashboardApiMockService>;

  beforeEach(() => {
    apiMockService = {
      getDashboardViewModel: () => of(DASHBOARD_MODEL_MOCK),
      getCareerSnapshot: (query: string) =>
        of({
          career: query,
          annualSalaryUsd: '0',
          demandLevel: 'Low',
          marketGrowth: '0%',
          learningRoute: '',
          profileFit: '0%',
        } as CareerSnapshot),
    };

    TestBed.configureTestingModule({
      providers: [
        DashboardContentService,
        { provide: DashboardApiMockService, useValue: apiMockService },
      ],
    });
    service = TestBed.inject(DashboardContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial state loading then false', () => {
    // Since it calls loadDashboard in constructor and we mocked it to return 'of' (immediate)
    // it should be false by the time it is injected if it completes immediately
    expect(service.isLoading()).toBe(false);
  });

  it('should provide the dashboard view model through vm()', () => {
    const vm = service.vm();
    expect(vm).toEqual(DASHBOARD_MODEL_MOCK);
    expect(vm.brand).toBe('Itera');
  });

  it('should call getCareerSnapshot from API service', async () => {
    const response = await new Promise<CareerSnapshot>((resolve) => {
      service
        .getCareerSnapshot('cloud')
        .subscribe((response) => resolve(response as CareerSnapshot));
    });
    expect(response.career).toBe('cloud');
  });
});
