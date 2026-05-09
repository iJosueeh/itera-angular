import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { CareerSnapshot, DashboardViewModel } from '../../../shared/interfaces/dashboard.interface';
import { DASHBOARD_MODEL_MOCK } from '../mocks/dashboard.mock';
import { CAREER_SNAPSHOTS_MOCK, DEFAULT_CAREER_SNAPSHOT_MOCK } from '../mocks/career-snapshot.mock';

@Injectable({ providedIn: 'root' })
export class DashboardApiMockService {
  getDashboardViewModel(): Observable<DashboardViewModel> {
    return of(DASHBOARD_MODEL_MOCK).pipe(delay(650));
  }

  getCareerSnapshot(query: string): Observable<CareerSnapshot> {
    const normalizedQuery = query.trim().toLowerCase();

    const matchedSnapshot = CAREER_SNAPSHOTS_MOCK.find((snapshot) =>
      normalizedQuery.includes(snapshot.career.toLowerCase())
    );

    const response = matchedSnapshot ?? {
      ...DEFAULT_CAREER_SNAPSHOT_MOCK,
      career: query
    };

    return of(response).pipe(delay(900));
  }
}
