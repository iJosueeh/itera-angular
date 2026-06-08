import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobOffer, CareerMetrics, MarketSkill, MatchRequest, MatchResult } from '@shared/interfaces/market.interface';

@Injectable({ providedIn: 'root' })
export class MarketApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/ia';

  getOffers(limit = 10, skip = 0): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.baseUrl}/offers`, {
      params: { limit, skip }
    });
  }

  getCareerMetrics(): Observable<CareerMetrics[]> {
    return this.http.get<CareerMetrics[]>(`${this.baseUrl}/careers/metrics`);
  }

  getMarketDemand(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/market/demand`);
  }

  getMarketSkills(): Observable<MarketSkill[]> {
    return this.http.get<MarketSkill[]>(`${this.baseUrl}/analytics/skills`);
  }

  evaluateMatch(request: MatchRequest): Observable<MatchResult> {
    return this.http.post<MatchResult>(`${this.baseUrl}/match/evaluate`, request);
  }

  runScraper(query: string): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(`${this.baseUrl}/scraper/run`, {}, {
      params: { query }
    });
  }

  sendTelemetry(event: { estudiante_id: string; accion: string; datos_contexto: any; tiempo_permanencia_segundos: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/telemetry/event`, event);
  }

  sendFeedback(feedback: { estudiante_id: string; entidad_evaluada: string; calificacion_estrellas: number; comentario?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/feedback/recommendation`, feedback);
  }

  getScrapingAudit(limit = 20): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/audit/scraping`, {
      params: { limit }
    });
  }
}
