import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  JobOffer,
  CareerMetrics,
  MarketSkill,
  MatchRequest,
  MatchResult,
  TopCompany,
  CareerCategory,
} from '@shared/interfaces/market.interface';

export interface OfferFilters {
  q?: string;
  skill?: string;
  modality?: string;
  salary_min?: number;
  salary_max?: number;
}

export interface SalaryByCareerResponse {
  careers: Array<{
    titulo_carrera: string;
    salario_min: number;
    salario_max: number;
    salario_promedio: number;
    volumen_total: number;
    tendencia: string;
    habilidades_clave: string[];
  }>;
  summary: {
    total_offers: number;
    avg_salary_weighted: number;
    career_count: number;
  };
}

@Injectable({ providedIn: 'root' })
export class MarketApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/ia';

  getOffers(
    limit = 10,
    skip = 0,
    filters?: OfferFilters,
  ): Observable<JobOffer[]> {
    const params: Record<string, string | number> = { limit, skip };

    if (filters) {
      if (filters.q) params['q'] = filters.q;
      if (filters.skill) params['skill'] = filters.skill;
      if (filters.modality) params['modality'] = filters.modality;
      if (filters.salary_min !== undefined) params['salary_min'] = filters.salary_min;
      if (filters.salary_max !== undefined) params['salary_max'] = filters.salary_max;
    }

    return this.http.get<JobOffer[]>(`${this.baseUrl}/offers`, { params });
  }

  getCareerMetrics(): Observable<CareerMetrics[]> {
    return this.http.get<CareerMetrics[]>(`${this.baseUrl}/careers/metrics`);
  }

  getMarketDemand(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/market/demand`);
  }

  getSalaryByCareer(): Observable<SalaryByCareerResponse> {
    return this.http.get<SalaryByCareerResponse>(`${this.baseUrl}/market/salary-by-career`);
  }

  getMarketSkills(): Observable<MarketSkill[]> {
    return this.http.get<MarketSkill[]>(`${this.baseUrl}/analytics/skills`);
  }

  evaluateMatch(request: MatchRequest): Observable<MatchResult> {
    return this.http.post<MatchResult>(`${this.baseUrl}/match/evaluate`, request);
  }

  runScraper(query: string): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(
      `${this.baseUrl}/scraper/run`,
      {},
      {
        params: { query },
      },
    );
  }

  sendTelemetry(event: {
    estudiante_id: string;
    accion: string;
    datos_contexto: any;
    tiempo_permanencia_segundos: number;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/telemetry/event`, event);
  }

  sendFeedback(feedback: {
    estudiante_id: string;
    entidad_evaluada: string;
    calificacion_estrellas: number;
    comentario?: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/feedback/recommendation`, feedback);
  }

  getScrapingAudit(limit = 20): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/audit/scraping`, {
      params: { limit },
    });
  }

  /** GET /companies/top - List top companies by tier */
  getTopCompanies(
    minTier: number = 2,
    limit: number = 20,
  ): Observable<{ min_tier: number; total: number; companies: TopCompany[] }> {
    let params = new HttpParams()
      .set('min_tier', minTier.toString())
      .set('limit', limit.toString());
    return this.http.get<any>(`${this.baseUrl}/companies/top`, { params });
  }

  /** GET /careers/categories - List all career categories */
  getCareersCategories(): Observable<{ total: number; categories: CareerCategory[] }> {
    return this.http.get<any>(`${this.baseUrl}/careers/categories`);
  }

  /** POST /analytics/backfill - Re-enrich legacy offers (admin) */
  runBackfill(
    dryRun: boolean = true,
    useAi: boolean = false,
    limit: number = 200,
  ): Observable<any> {
    let params = new HttpParams()
      .set('dry_run', dryRun.toString())
      .set('use_ai', useAi.toString())
      .set('limit', limit.toString());
    return this.http.post(`${this.baseUrl}/analytics/backfill`, {}, { params });
  }

  /** POST /companies/cleanup - Clean dirty company names (admin) */
  cleanupCompanyNames(
    dryRun: boolean = true,
    limit: number = 500,
  ): Observable<any> {
    let params = new HttpParams()
      .set('dry_run', dryRun.toString())
      .set('limit', limit.toString());
    return this.http.post(`${this.baseUrl}/companies/cleanup`, {}, { params });
  }

  /** POST /analytics/refresh - Refresh market metrics */
  refreshAnalytics(): Observable<any> {
    return this.http.post(`${this.baseUrl}/analytics/refresh`, {});
  }
}
