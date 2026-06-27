import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';

import {
  LearningApiService,
  LearningPath,
  LearningNode,
} from '@features/home/services/learning-api.service';
import { AuthStorageService } from '@shared/services/auth-storage.service';

@Component({
  selector: 'itera-learning-map',
  standalone: true,
  imports: [],
  template: `
    @if (isLoading()) {
      <div class="paths-grid">
        @for (i of [1, 2, 3, 4, 5]; track i) {
          <div class="path-card-skeleton">
            <div class="skeleton h-12 w-12 rounded-xl"></div>
            <div class="skeleton h-4 w-24 rounded-lg mt-3"></div>
            <div class="skeleton h-3 w-16 rounded-lg mt-1"></div>
            <div class="skeleton h-2 w-full rounded-full mt-3"></div>
          </div>
        }
      </div>
    } @else {
      <!-- ═══════ PATH CARDS GRID ═══════ -->
      <div class="paths-grid">
        @for (p of allPaths(); track p.goal_id) {
          <button class="path-card" [style.--pc]="p.color" (click)="openPath(p)">
            <div class="path-card__icon">
              <i [class]="'bi ' + getPathIcon(p.goal_id)"></i>
            </div>
            <h4 class="path-card__title">{{ p.title }}</h4>
            <p class="path-card__meta">{{ p.nodes.length }} módulos</p>
            <div class="path-card__bar">
              <div
                class="path-card__bar-fill"
                [style.width.%]="getPathProgress(p.goal_id)"
                [style.background]="p.color"
              ></div>
            </div>
            <span class="path-card__percent" [style.color]="p.color">
              {{ getPathProgress(p.goal_id) }}%
            </span>
          </button>
        }
      </div>
    }

    <!-- ═══════ PATH DETAIL MODAL ═══════ -->
    @if (activePath()) {
      <div class="modal-backdrop" (click)="closeModal($event)">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <!-- Modal header -->
          <div class="modal-header" [style.--mc]="activePath()!.color">
            <div class="modal-header__left">
              <div class="modal-header__icon">
                <i [class]="'bi ' + getPathIcon(activePath()!.goal_id)"></i>
              </div>
              <div>
                <h3 class="modal-header__title">{{ activePath()!.title }}</h3>
                <p class="modal-header__subtitle">{{ activePath()!.subtitle }}</p>
              </div>
            </div>
            <div class="modal-header__right">
              <div class="modal-progress-ring">
                <svg viewBox="0 0 36 36">
                  <path
                    class="ring-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    class="ring-fg"
                    [attr.stroke]="activePath()!.color"
                    [attr.stroke-dasharray]="modalPercent() + ', 100'"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span class="ring-text">{{ modalPercent() }}%</span>
              </div>
              <button class="modal-close" (click)="activePath.set(null)">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <!-- Node timeline -->
          <div class="modal-body">
            @for (node of sortedNodes(); track node.id; let last = $last; let idx = $index) {
              <div class="node-row">
                @if (!last) {
                  <div
                    class="node-line"
                    [class.node-line--done]="isCompleted(node.id) || isCurrent(node.id)"
                  ></div>
                }
                <button
                  class="node-dot"
                  [class.node-dot--done]="isCompleted(node.id)"
                  [class.node-dot--current]="isCurrent(node.id)"
                  [style.--nc]="activePath()!.color"
                  (click)="toggleNode(node.id)"
                >
                  @if (isCompleted(node.id)) {
                    <i class="bi bi-check-lg"></i>
                  } @else if (isCurrent(node.id)) {
                    <i class="bi bi-play-fill"></i>
                  } @else {
                    <span>{{ idx + 1 }}</span>
                  }
                </button>
                <div class="node-info">
                  <div class="node-info__row">
                    <h5 class="node-info__name">{{ node.name }}</h5>
                    <div class="node-info__tags">
                      <span class="ntag ntag--d" [class]="'ntag--' + node.difficulty">
                        {{ getDiffLabel(node.difficulty) }}
                      </span>
                      <span class="ntag ntag--w">{{ node.estimated_weeks }}sem</span>
                    </div>
                  </div>
                  <p class="node-info__desc">{{ node.description }}</p>

                  <!-- Resources inline -->
                  @if (node.resources && node.resources.length > 0) {
                    <button class="res-toggle" (click)="toggleRes(node.id)">
                      <i
                        class="bi"
                        [class.bi-chevron-down]="expandedRes() !== node.id"
                        [class.bi-chevron-up]="expandedRes() === node.id"
                      ></i>
                      {{ node.resources.length }} recursos
                    </button>
                    @if (expandedRes() === node.id) {
                      <div class="res-list">
                        @for (res of node.resources; track res.url) {
                          <a class="res-item" [href]="res.url" target="_blank" rel="noopener">
                            <span class="res-icon" [class]="'res-icon--' + res.type">
                              @switch (res.type) {
                                @case ('course') {
                                  <i class="bi bi-book"></i>
                                }
                                @case ('article') {
                                  <i class="bi bi-file-text"></i>
                                }
                                @case ('practice') {
                                  <i class="bi bi-code-slash"></i>
                                }
                                @case ('tool') {
                                  <i class="bi bi-tools"></i>
                                }
                                @case ('book') {
                                  <i class="bi bi-book-half"></i>
                                }
                              }
                            </span>
                            <div class="res-info">
                              <span class="res-name">{{ res.name }}</span>
                              <span class="res-desc">{{ res.description }}</span>
                            </div>
                            @if (res.is_free) {
                              <span class="res-free">Gratis</span>
                            }
                          </a>
                        }
                      </div>
                    }
                  }
                </div>
              </div>
            }
          </div>

          <!-- Summary footer -->
          <div class="modal-footer">
            <span class="modal-footer__item modal-footer__item--done">
              <i class="bi bi-check-circle-fill"></i> {{ completedCount() }} completados
            </span>
            <span class="modal-footer__item modal-footer__item--active">
              <i class="bi bi-play-circle-fill"></i> {{ inProgressCount() }} en progreso
            </span>
            <span class="modal-footer__item modal-footer__item--pending">
              <i class="bi bi-clock-history"></i> {{ plannedCount() }} restantes
            </span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      /* ═══════════════════════════════════════
       PATH CARDS GRID
    ═══════════════════════════════════════ */
      .paths-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0.75rem;
        font-family: 'Inter', system-ui, sans-serif;
      }
      @media (max-width: 768px) {
        .paths-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      @media (max-width: 480px) {
        .paths-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .path-card-skeleton {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.25rem 0.75rem;
        background: #f8fafc;
        border-radius: 1rem;
        border: 1px solid #e2e8f0;
      }

      .path-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.25rem 0.75rem;
        background: #f8fafc;
        border: 1.5px solid #e2e8f0;
        border-radius: 1rem;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: center;
      }
      .path-card:hover {
        border-color: var(--pc, #94a3b8);
        background: color-mix(in srgb, var(--pc, #94a3b8) 5%, white);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px color-mix(in srgb, var(--pc, #94a3b8) 15%, transparent);
      }

      .path-card__icon {
        width: 3rem;
        height: 3rem;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--pc, #6366f1) 12%, white);
        color: var(--pc, #6366f1);
        font-size: 1.25rem;
        transition: all 0.2s ease;
      }
      .path-card:hover .path-card__icon {
        background: var(--pc, #6366f1);
        color: white;
      }

      .path-card__title {
        font-size: 0.8125rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0.75rem 0 0.125rem 0;
      }
      .path-card__meta {
        font-size: 0.6875rem;
        color: #94a3b8;
        margin: 0;
      }

      .path-card__bar {
        width: 100%;
        height: 0.25rem;
        border-radius: 9999px;
        background: #e2e8f0;
        margin-top: 0.75rem;
        overflow: hidden;
      }
      .path-card__bar-fill {
        height: 100%;
        border-radius: 9999px;
        transition: width 0.5s ease;
      }

      .path-card__percent {
        font-size: 0.6875rem;
        font-weight: 700;
        margin-top: 0.375rem;
      }

      /* ═══════════════════════════════════════
       MODAL BACKDROP
    ═══════════════════════════════════════ */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 50;
        background: rgba(15, 23, 42, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        animation: fadeIn 0.15s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .modal-panel {
        background: white;
        border-radius: 1.25rem;
        width: 100%;
        max-width: 560px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        animation: slideUp 0.2s ease;
        overflow: hidden;
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(16px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Modal header */
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        background: color-mix(in srgb, var(--mc, #6366f1) 4%, white);
      }
      .modal-header__left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .modal-header__icon {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.625rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--mc, #6366f1);
        color: white;
        font-size: 1.125rem;
      }
      .modal-header__title {
        font-size: 1rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }
      .modal-header__subtitle {
        font-size: 0.6875rem;
        color: #64748b;
        margin: 0.125rem 0 0 0;
      }
      .modal-header__right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .modal-progress-ring {
        position: relative;
        width: 2.25rem;
        height: 2.25rem;
      }
      .modal-progress-ring svg {
        width: 100%;
        height: 100%;
      }
      .ring-bg {
        fill: none;
        stroke: #e2e8f0;
        stroke-width: 3;
      }
      .ring-fg {
        fill: none;
        stroke-width: 3;
        stroke-linecap: round;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
        transition: stroke-dasharray 0.5s ease;
      }
      .ring-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.5rem;
        font-weight: 700;
        color: #1e293b;
      }

      .modal-close {
        width: 2rem;
        height: 2rem;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 0.875rem;
      }
      .modal-close:hover {
        background: #f1f5f9;
        color: #475569;
      }

      /* Modal body */
      .modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 1.25rem 1.5rem;
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 transparent;
      }
      .modal-body::-webkit-scrollbar {
        width: 4px;
      }
      .modal-body::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }

      /* Node rows */
      .node-row {
        display: flex;
        gap: 0.75rem;
        position: relative;
        padding-bottom: 0.75rem;
      }
      .node-line {
        position: absolute;
        left: 0.9375rem;
        top: 2.25rem;
        width: 2px;
        height: calc(100% - 0.75rem);
        background: #e2e8f0;
        transition: background 0.3s;
      }
      .node-line--done {
        background: #10b981;
      }

      .node-dot {
        width: 1.875rem;
        height: 1.875rem;
        border-radius: 0.5rem;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #d1d5db;
        background: white;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.6875rem;
        font-weight: 700;
        color: #94a3b8;
      }
      .node-dot:hover {
        border-color: var(--nc, #6366f1);
      }
      .node-dot--done {
        background: #10b981;
        border-color: #10b981;
        color: white;
      }
      .node-dot--current {
        border-color: #3b82f6;
        color: #3b82f6;
      }

      .node-info {
        flex: 1;
        min-width: 0;
      }
      .node-info__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .node-info__name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
      }
      .node-info__tags {
        display: flex;
        gap: 0.25rem;
        flex-shrink: 0;
      }
      .ntag {
        font-size: 0.5625rem;
        font-weight: 600;
        padding: 0.0625rem 0.375rem;
        border-radius: 9999px;
      }
      .ntag--d {
        text-transform: uppercase;
      }
      .ntag--basic {
        background: #dbeafe;
        color: #1d4ed8;
      }
      .ntag--intermediate {
        background: #fef3c7;
        color: #b45309;
      }
      .ntag--advanced {
        background: #fce7f3;
        color: #be185d;
      }
      .ntag--w {
        color: #94a3b8;
        background: #f1f5f9;
      }
      .node-info__desc {
        font-size: 0.6875rem;
        color: #64748b;
        margin: 0.25rem 0 0 0;
        line-height: 1.4;
      }

      /* Resources */
      .res-toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.6875rem;
        color: #6366f1;
        font-weight: 600;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem 0;
      }
      .res-toggle:hover {
        text-decoration: underline;
      }
      .res-list {
        margin-top: 0.375rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .res-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4375rem 0.5rem;
        background: #f8fafc;
        border: 1px solid #f1f5f9;
        border-radius: 0.5rem;
        text-decoration: none;
        transition: all 0.15s ease;
      }
      .res-item:hover {
        border-color: #c7d2fe;
        background: #f5f3ff;
      }
      .res-icon {
        width: 1.375rem;
        height: 1.375rem;
        border-radius: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.625rem;
        flex-shrink: 0;
      }
      .res-icon--course {
        background: #dbeafe;
        color: #2563eb;
      }
      .res-icon--article {
        background: #dcfce7;
        color: #16a34a;
      }
      .res-icon--practice {
        background: #fef3c7;
        color: #d97706;
      }
      .res-icon--tool {
        background: #e0e7ff;
        color: #4f46e5;
      }
      .res-icon--book {
        background: #fce7f3;
        color: #db2777;
      }
      .res-info {
        flex: 1;
        min-width: 0;
      }
      .res-name {
        display: block;
        font-size: 0.6875rem;
        font-weight: 600;
        color: #1e293b;
      }
      .res-desc {
        display: block;
        font-size: 0.5625rem;
        color: #94a3b8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .res-free {
        font-size: 0.5rem;
        font-weight: 600;
        padding: 0.0625rem 0.3125rem;
        border-radius: 9999px;
        background: #dcfce7;
        color: #166534;
        flex-shrink: 0;
      }

      /* Modal footer */
      .modal-footer {
        display: flex;
        justify-content: center;
        gap: 1.25rem;
        padding: 0.75rem 1.5rem;
        border-top: 1px solid #e2e8f0;
        background: #f8fafc;
      }
      .modal-footer__item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.6875rem;
        font-weight: 500;
      }
      .modal-footer__item i {
        font-size: 0.8125rem;
      }
      .modal-footer__item--done {
        color: #10b981;
      }
      .modal-footer__item--active {
        color: #3b82f6;
      }
      .modal-footer__item--pending {
        color: #64748b;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningMapComponent implements OnInit {
  private readonly learningApi = inject(LearningApiService);
  private readonly authStorage = inject(AuthStorageService);

  readonly allPaths = signal<LearningPath[]>([]);
  readonly progressMap = signal<Record<string, number>>({});
  readonly isLoading = signal(true);

  // Modal state
  readonly activePath = signal<LearningPath | null>(null);
  readonly completedNodeIds = signal<string[]>([]);
  readonly currentNodeId = signal<string | null>(null);
  readonly expandedRes = signal<string | null>(null);

  readonly sortedNodes = computed(() => {
    const p = this.activePath();
    if (!p) return [];
    return [...p.nodes].sort((a, b) => a.order - b.order);
  });

  readonly modalPercent = computed(() => {
    const p = this.activePath();
    if (!p || p.nodes.length === 0) return 0;
    return Math.round((this.completedNodeIds().length / p.nodes.length) * 100);
  });

  readonly completedCount = computed(() => this.completedNodeIds().length);
  readonly inProgressCount = computed(() => (this.currentNodeId() ? 1 : 0));
  readonly plannedCount = computed(() => {
    const p = this.activePath();
    if (!p) return 0;
    return p.nodes.length - this.completedNodeIds().length - (this.currentNodeId() ? 1 : 0);
  });

  constructor() {}

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.isLoading.set(true);
    this.learningApi.getPaths().subscribe({
      next: (res) => {
        this.allPaths.set(res.paths);
        this.loadAllProgress();
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private loadAllProgress(): void {
    const userId = this.authStorage.getUserId();
    if (!userId) return;
    this.learningApi.getProgress(userId).subscribe({
      next: (data) => {
        const map: Record<string, number> = {};
        for (const rec of data.progress) {
          map[rec.goal_id] = rec.progress_percent;
        }
        this.progressMap.set(map);
      },
    });
  }

  getPathProgress(goalId: string): number {
    return this.progressMap()[goalId] ?? 0;
  }

  openPath(path: LearningPath): void {
    this.activePath.set(path);
    this.expandedRes.set(null);
    this.loadPathProgress(path.goal_id);
  }

  private loadPathProgress(goalId: string): void {
    const userId = this.authStorage.getUserId();
    if (!userId) {
      this.currentNodeId.set(this.findFirstUncompleted());
      return;
    }
    this.learningApi.getProgress(userId).subscribe({
      next: (data) => {
        const rec = data.progress.find((p) => p.goal_id === goalId);
        this.completedNodeIds.set(rec?.completed_nodes ?? []);
        this.currentNodeId.set(rec?.current_node ?? this.findFirstUncompleted());
      },
      error: () => {
        this.currentNodeId.set(this.findFirstUncompleted());
      },
    });
  }

  private findFirstUncompleted(): string | null {
    const p = this.activePath();
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
    const p = this.activePath();
    if (!userId || !p) return;

    const wasCompleted = this.isCompleted(nodeId);
    if (wasCompleted) {
      this.completedNodeIds.update((ids) => ids.filter((id) => id !== nodeId));
    } else {
      this.completedNodeIds.update((ids) => [...ids, nodeId]);
    }
    this.currentNodeId.set(this.findFirstUncompleted());

    this.learningApi.toggleNode(userId, p.goal_id, nodeId, !wasCompleted).subscribe({
      error: () => {
        if (wasCompleted) {
          this.completedNodeIds.update((ids) => [...ids, nodeId]);
        } else {
          this.completedNodeIds.update((ids) => ids.filter((id) => id !== nodeId));
        }
        this.currentNodeId.set(this.findFirstUncompleted());
      },
    });
  }

  toggleRes(nodeId: string): void {
    this.expandedRes.set(this.expandedRes() === nodeId ? null : nodeId);
  }

  closeModal(event: MouseEvent): void {
    this.activePath.set(null);
  }

  getDiffLabel(d: string): string {
    const map: Record<string, string> = {
      basic: 'Básico',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
    };
    return map[d] ?? d;
  }

  getPathIcon(goalId: string): string {
    const icons: Record<string, string> = {
      Backend: 'bi-server',
      AI: 'bi-robot',
      Cloud: 'bi-cloud',
      Frontend: 'bi-window',
      General: 'bi-grid',
    };
    return icons[goalId] ?? 'bi-signpost-2';
  }
}
