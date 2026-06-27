import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SkillCategory {
  category: string;
  category_label: string;
  skills: string[];
}

export interface SkillsCatalog {
  categories: SkillCategory[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class SkillsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/ia/skills';

  getCatalog(): Observable<SkillsCatalog> {
    return this.http.get<SkillsCatalog>(`${this.baseUrl}/catalog`);
  }
}
