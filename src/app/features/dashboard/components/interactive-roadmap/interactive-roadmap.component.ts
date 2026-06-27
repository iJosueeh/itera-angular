import {
  ChangeDetectionStrategy,
  Component,
  input,
  inject,
  signal,
  computed,
  effect,
  OnInit,
} from '@angular/core';

import {
  LearningApiService,
  LearningPath,
  LearningNode,
  LearningResource,
} from '@features/home/services/learning-api.service';
import { AuthStorageService } from '@shared/services/auth-storage.service';

@Component({
  selector: 'itera-interactive-roadmap',
  standalone: true,
  imports: [],
  template: `
    @if (isLoading()) {
      <div class="space-y-4">
        @for (i of [1, 2, 3, 4, 5]; track i) {
          <div class="flex gap-3 p-3 bg-slate-50 rounded-xl">
            <div class="skeleton h-10 w-10 rounded-lg flex-shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="skeleton h-4 w-40 rounded-lg"></div>
              <div class="skeleton h-3 w-full rounded-lg"></div>
              <div class="skeleton h-3 w-20 rounded-lg"></div>
            </div>
          </div>
        }
      </div>
    } @else if (path()) {
      <div class="roadmap-container">
        <div class="roadmap-header">
          <div class="roadmap-info">
            <h3 class="roadmap-title" [style.color]="path()!.color">
              {{ path()!.title }}
            </h3>
            <p class="roadmap-subtitle">{{ path()!.subtitle }}</p>
          </div>
          <div class="roadmap-progress">
            <div class="progress-circle">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="circle-fg"
                  [attr.stroke]="path()!.color"
                  [attr.stroke-dasharray]="progressPercent() + ', 100'"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span class="progress-text">{{ progressPercent() }}%</span>
            </div>
          </div>
        </div>

        <div class="roadmap-timeline">
          @for (node of sortedNodes(); track node.id; let last = $last) {
            <div class="timeline-item">
              @if (!last) {
                <div class="timeline-connector"
                  [class.active]="isCompleted(node.id) || isCurrent(node.id)"></div>
              }
              <div class="timeline-node"
                [class.status-completed]="isCompleted(node.id)"
                [class.status-in-progress]="isCurrent(node.id)"
                [class.status-planned]="!isCompleted(node.id) && !isCurrent(node.id)">
                <button class="node-checkbox"
                  [class.checked]="isCompleted(node.id)"
                  [class.current]="isCurrent(node.id)"
                  (click)="toggleNode(node.id)">
                  @if (isCompleted(node.id)) {
                    <i class="bi bi-check-lg"></i>
                  } @else if (isCurrent(node.id)) {
                    <i class="bi bi-play-fill"></i>
                  }
                </button>
                <div class="node-content">
                  <div class="node-header">
                    <h4 class="node-name">{{ node.name }}</h4>
                    <div class="node-badges">
                      <span class="node-difficulty" [class]="'diff-' + node.difficulty">
                        {{ getDifficultyLabel(node.difficulty) }}
                      </span>
                      <span class="node-weeks">{{ node.estimated_weeks }} sem</span>
                    </div>
                  </div>
                  <p class="node-description">{{ node.description }}</p>
                  @if (node.resources && node.resources.length > 0) {
                    <button class="resources-toggle" (click)="toggleResources(node.id)">
                      <i class="bi"
                        [class.bi-chevron-down]="expandedNode() !== node.id"
                        [class.bi-chevron-up]="expandedNode() === node.id"></i>
                      {{ node.resources.length }} recursos
                    </button>
                    @if (expandedNode() === node.id) {
                      <div class="resources-list">
                        @for (res of node.resources; track res.url) {
                          <a class="resource-item" [href]="res.url" target="_blank" rel="noopener">
                            <span class="resource-icon" [class]="'icon-' + res.type">
                              @switch (res.type) {
                                @case ('course') { <i class="bi bi-book"></i> }
                                @case ('article') { <i class="bi bi-file-text"></i> }
                                @case ('practice') { <i class="bi bi-code-slash"></i> }
                                @case ('tool') { <i class="bi bi-tools"></i> }
                                @case ('book') { <i class="bi bi-book-half"></i> }
                              }
                            </span>
                            <div class="resource-info">
                              <span class="resource-name">{{ res.name }}</span>
                              <span class="resource-desc">{{ res.description }}</span>
                            </div>
                            @if (res.is_free) {
                              <span class="resource-free">Gratis</span>
                            }
                          </a>
                        }
                      </div>
                    }
                  }
                </div>
              </div>
            </div>
          }
        </div>

        <div class="roadmap-summary">
          <div class="summary-item completed">
            <i class="bi bi-check-circle-fill"></i>
            <span>{{ completedCount() }} completados</span>
          </div>
          <div class="summary-item in-progress">
            <i class="bi bi-play-circle-fill"></i>
            <span>{{ inProgressCount() }} en progreso</span>
          </div>
          <div class="summary-item planned">
            <i class="bi bi-clock-history"></i>
            <span>{{ plannedCount() }} restantes</span>
          </div>
        </div>
      </div>
    } @else {
      <div class="text-center py-8 text-slate-400 text-sm">
        Selecciona un objetivo académico para ver tu ruta.
      </div>
    }
  `,
  styles: [
    `
      .roadmap-container { font-family: 'Inter', system-ui, sans-serif; }
      .roadmap-header {
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0;
      }
      .roadmap-title { font-size: 1.125rem; font-weight: 700; margin: 0 0 0.25rem 0; }
      .roadmap-subtitle { font-size: 0.75rem; color: #64748b; margin: 0; }
      .roadmap-progress { display: flex; align-items: center; }
      .progress-circle { position: relative; width: 3rem; height: 3rem; }
      .circular-chart { width: 100%; height: 100%; }
      .circle-bg { fill: none; stroke: #e2e8f0; stroke-width: 3; }
      .circle-fg {
        fill: none; stroke-width: 3; stroke-linecap: round;
        transform: rotate(-90deg); transform-origin: 50% 50%;
        transition: stroke-dasharray 0.5s ease;
      }
      .progress-text {
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%); font-size: 0.625rem; font-weight: 700; color: #1e293b;
      }
      .roadmap-timeline { display: flex; flex-direction: column; }
      .timeline-item { display: flex; gap: 0.75rem; position: relative; }
      .timeline-connector {
        position: absolute; left: 1.125rem; top: 2.75rem;
        width: 2px; height: calc(100% - 0.75rem); background: #e2e8f0;
        transition: background 0.3s ease;
      }
      .timeline-connector.active { background: #10b981; }
      .timeline-node {
        display: flex; gap: 0.75rem; padding: 0.875rem;
        background: #f8fafc; border-radius: 0.75rem; border: 1px solid #e2e8f0;
        margin-bottom: 0.5rem; transition: all 0.2s ease; flex: 1;
      }
      .timeline-node:hover { border-color: #cbd5e1; }
      .timeline-node.status-completed { background: #f0fdf4; border-color: #bbf7d0; }
      .timeline-node.status-in-progress { background: #eff6ff; border-color: #bfdbfe; border-left: 3px solid #3b82f6; }
      .timeline-node.status-planned { opacity: 0.8; }
      .node-checkbox {
        width: 2rem; height: 2rem; border-radius: 0.5rem; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid #d1d5db; background: white; cursor: pointer;
        transition: all 0.2s ease; color: transparent; font-size: 0.875rem;
      }
      .node-checkbox:hover { border-color: #6366f1; }
      .node-checkbox.checked { background: #10b981; border-color: #10b981; color: white; }
      .node-checkbox.current { border-color: #3b82f6; color: #3b82f6; }
      .node-content { flex: 1; min-width: 0; }
      .node-header { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.25rem; }
      .node-name { font-size: 0.875rem; font-weight: 600; color: #1e293b; margin: 0; }
      .node-badges { display: flex; gap: 0.375rem; align-items: center; flex-shrink: 0; }
      .node-difficulty {
        font-size: 0.5625rem; font-weight: 600; padding: 0.125rem 0.375rem;
        border-radius: 9999px; text-transform: uppercase;
      }
      .diff-basic { background: #dbeafe; color: #1d4ed8; }
      .diff-intermediate { background: #fef3c7; color: #b45309; }
      .diff-advanced { background: #fce7f3; color: #be185d; }
      .node-weeks { font-size: 0.625rem; color: #94a3b8; white-space: nowrap; }
      .node-description { font-size: 0.75rem; color: #64748b; margin: 0 0 0.5rem 0; line-height: 1.4; }
      .resources-toggle {
        display: inline-flex; align-items: center; gap: 0.25rem;
        font-size: 0.6875rem; color: #6366f1; font-weight: 600;
        background: none; border: none; cursor: pointer; padding: 0.25rem 0;
      }
      .resources-toggle:hover { text-decoration: underline; }
      .resources-list { margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.375rem; }
      .resource-item {
        display: flex; align-items: center; gap: 0.5rem;
        padding: 0.5rem 0.625rem; background: white; border: 1px solid #f1f5f9;
        border-radius: 0.5rem; text-decoration: none; transition: all 0.15s ease;
      }
      .resource-item:hover { border-color: #c7d2fe; background: #f5f3ff; }
      .resource-icon {
        width: 1.5rem; height: 1.5rem; border-radius: 0.25rem;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.6875rem; flex-shrink: 0;
      }
      .icon-course { background: #dbeafe; color: #2563eb; }
      .icon-article { background: #dcfce7; color: #16a34a; }
      .icon-practice { background: #fef3c7; color: #d97706; }
      .icon-tool { background: #e0e7ff; color: #4f46e5; }
      .icon-book { background: #fce7f3; color: #db2777; }
      .resource-info { flex: 1; min-width: 0; }
      .resource-name { display: block; font-size: 0.75rem; font-weight: 600; color: #1e293b; }
      .resource-desc { display: block; font-size: 0.625rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .resource-free {
        font-size: 0.5625rem; font-weight: 600; padding: 0.125rem 0.375rem;
        border-radius: 9999px; background: #dcfce7; color: #166534; flex-shrink: 0;
      }
      .roadmap-summary {
        display: flex; justify-content: center; gap: 1.5rem;
        margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;
      }
      .summary-item { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; font-weight: 500; }
      .summary-item i { font-size: 0.875rem; }
      .summary-item.completed { color: #10b981; }
      .summary-item.in-progress { color: #3b82f6; }
      .summary-item.planned { color: #64748b; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InteractiveRoadmapComponent implements OnInit {
  academicGoal = input<string>('General');

  private readonly learningApi = inject(LearningApiService);
  private readonly authStorage = inject(AuthStorageService);

  readonly path = signal<LearningPath | null>(null);
  readonly completedNodeIds = signal<string[]>([]);
  readonly currentNodeId = signal<string | null>(null);
  readonly isLoading = signal(true);
  readonly expandedNode = signal<string | null>(null);

  readonly sortedNodes = computed(() => {
    const p = this.path();
    if (!p) return [];
    return [...p.nodes].sort((a, b) => a.order - b.order);
  });

  readonly progressPercent = computed(() => {
    const p = this.path();
    if (!p || p.nodes.length === 0) return 0;
    return Math.round((this.completedNodeIds().length / p.nodes.length) * 100);
  });

  readonly completedCount = computed(() => this.completedNodeIds().length);
  readonly inProgressCount = computed(() => (this.currentNodeId() ? 1 : 0));
  readonly plannedCount = computed(() => {
    const p = this.path();
    if (!p) return 0;
    return p.nodes.length - this.completedNodeIds().length - (this.currentNodeId() ? 1 : 0);
  });

  constructor() {
    effect(() => {
      const goal = this.academicGoal();
      if (goal) {
        this.loadPath(goal);
      }
    });
  }

  ngOnInit(): void {
    const goal = this.academicGoal();
    if (goal) this.loadPath(goal);
  }

  private loadPath(goalId: string): void {
    this.isLoading.set(true);
    this.learningApi.getPath(goalId).subscribe({
      next: (path) => {
        this.path.set(path);
        this.loadProgress(goalId);
      },
      error: () => {
        this.path.set(null);
        this.isLoading.set(false);
      },
    });
  }

  private loadProgress(goalId: string): void {
    const userId = this.authStorage.getUserId();
    if (!userId) {
      this.currentNodeId.set(this.findFirstUncompleted());
      this.isLoading.set(false);
      return;
    }
    this.learningApi.getProgress(userId).subscribe({
      next: (data) => {
        const rec = data.progress.find((p) => p.goal_id === goalId);
        this.completedNodeIds.set(rec?.completed_nodes ?? []);
        this.currentNodeId.set(rec?.current_node ?? this.findFirstUncompleted());
        this.isLoading.set(false);
      },
      error: () => {
        this.currentNodeId.set(this.findFirstUncompleted());
        this.isLoading.set(false);
      },
    });
  }

  private findFirstUncompleted(): string | null {
    const p = this.path();
    if (!p) return null;
    const completed = this.completedNodeIds();
    const sorted = [...p.nodes].sort((a, b) => a.order - b.order);
    for (const node of sorted) {
      if (!completed.includes(node.id)) return node.id;
    }
    return null;
  }

  isCompleted(nodeId: string): boolean {
    return this.completedNodeIds().includes(nodeId);
  }

  isCurrent(nodeId: string): boolean {
    return this.currentNodeId() === nodeId && !this.isCompleted(nodeId);
  }

  toggleNode(nodeId: string): void {
    const userId = this.authStorage.getUserId();
    const goalId = this.academicGoal();
    if (!userId || !goalId) return;

    const wasCompleted = this.isCompleted(nodeId);
    // Optimistic update
    if (wasCompleted) {
      this.completedNodeIds.update((ids) => ids.filter((id) => id !== nodeId));
    } else {
      this.completedNodeIds.update((ids) => [...ids, nodeId]);
    }
    this.currentNodeId.set(this.findFirstUncompleted());

    this.learningApi.toggleNode(userId, goalId, nodeId, !wasCompleted).subscribe({
      error: () => {
        if (wasCompleted) {
          this.completedNodeIds.update((ids) => [...ids, nodeId]);
        } else {
          this.completedNodeIds.update((ids) => ids.filter((id) => id !== nodeId));
        }
      },
    });
  }

  toggleResources(nodeId: string): void {
    this.expandedNode.set(this.expandedNode() === nodeId ? null : nodeId);
  }

  getDifficultyLabel(d: string): string {
    const map: Record<string, string> = { basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado' };
    return map[d] ?? d;
  }
}
