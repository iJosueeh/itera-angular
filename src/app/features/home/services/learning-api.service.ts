import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LearningResource {
  type: 'course' | 'article' | 'practice' | 'tool' | 'book';
  name: string;
  url: string;
  is_free: boolean;
  description?: string;
}

export interface LearningNode {
  id: string;
  name: string;
  description: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  estimated_weeks: number;
  status: 'completed' | 'in-progress' | 'planned' | 'attention';
  icon: string;
  order: number;
  resources: LearningResource[];
}

export interface LearningPath {
  goal_id: string;
  title: string;
  subtitle: string;
  color: string;
  nodes: LearningNode[];
}

export interface LearningProgress {
  user_id: string;
  goal_id: string;
  completed_nodes: string[];
  current_node: string | null;
  total_nodes: number;
  progress_percent: number;
}

export interface ToggleNodeResponse {
  status: string;
  completed_nodes: string[];
  current_node: string | null;
  total_nodes: number;
  progress_percent: number;
}

@Injectable({ providedIn: 'root' })
export class LearningApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/ia/learning';

  getPaths(): Observable<{ paths: LearningPath[]; total: number }> {
    return this.http.get<{ paths: LearningPath[]; total: number }>(
      `${this.baseUrl}/paths`,
    );
  }

  getPath(goalId: string): Observable<LearningPath> {
    return this.http.get<LearningPath>(`${this.baseUrl}/paths/${goalId}`);
  }

  toggleNode(
    userId: string,
    goalId: string,
    nodeId: string,
    completed: boolean,
  ): Observable<ToggleNodeResponse> {
    return this.http.put<ToggleNodeResponse>(`${this.baseUrl}/progress`, {
      user_id: userId,
      goal_id: goalId,
      node_id: nodeId,
      completed,
    });
  }

  getProgress(userId: string): Observable<{ user_id: string; progress: LearningProgress[] }> {
    return this.http.get<{ user_id: string; progress: LearningProgress[] }>(
      `${this.baseUrl}/progress/${userId}`,
    );
  }
}
