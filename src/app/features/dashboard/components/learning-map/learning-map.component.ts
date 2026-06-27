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

interface MapNode {
  node: LearningNode;
  x: number;
  y: number;
  pathColor: string;
  goalId: string;
}

interface SpokeConfig {
  angle: number; // degrees, 0 = right, CCW
  color: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'itera-learning-map',
  standalone: true,
  imports: [],
  template: `
    @if (isLoading()) {
      <div class="map-skeleton">
        <div class="skeleton" style="width:100%;height:100%;border-radius:1rem"></div>
      </div>
    } @else {
      <div class="map-wrapper">
        <!-- ═══════ SVG MAP ═══════ -->
        <div class="map-container">
          <svg [attr.viewBox]="'0 0 ' + SVG_W + ' ' + SVG_H" class="map-svg">
            <!-- Background subtle grid -->
            <defs>
              <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#6366f1" stop-opacity="0.12"/>
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
              </radialGradient>
              <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.08"/>
              </filter>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            <!-- Hub glow -->
            <circle [attr.cx]="CX" [attr.cy]="CY" r="90" fill="url(#hub-glow)"/>

            <!-- Spoke lines + path labels -->
            @for (spoke of spokeConfigs; track spoke.label; let i = $index) {
              @if (allPaths()[i]) {
                <!-- Spoke line -->
                <line
                  [attr.x1]="CX" [attr.y1]="CY"
                  [attr.x2]="getSpokeEndX(spoke.angle)"
                  [attr.y2]="getSpokeEndY(spoke.angle)"
                  [attr.stroke]="spoke.color"
                  stroke-width="2"
                  stroke-opacity="0.15"
                  stroke-dasharray="6 4"
                />
                <!-- Path label at end of spoke -->
                <text
                  [attr.x]="getSpokeEndX(spoke.angle)"
                  [attr.y]="getSpokeEndY(spoke.angle)"
                  [attr.fill]="spoke.color"
                  font-size="10"
                  font-weight="700"
                  font-family="Inter, system-ui, sans-serif"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  opacity="0.7"
                >{{ spoke.label }}</text>
              }
            }

            <!-- Node connections (lines between consecutive nodes on same spoke) -->
            @for (spoke of spokeConfigs; track spoke.label; let i = $index) {
              @if (getPathNodes(i).length > 1) {
                @for (pos of getPathNodes(i); track pos.node.id; let j = $index) {
                  @if (j < getPathNodes(i).length - 1) {
                    <line
                      [attr.x1]="pos.x" [attr.y1]="pos.y"
                      [attr.x2]="getPathNodes(i)[j + 1].x"
                      [attr.y2]="getPathNodes(i)[j + 1].y"
                      [attr.stroke]="spoke.color"
                      stroke-width="2"
                      stroke-opacity="0.25"
                    />
                  }
                }
              }
            }

            <!-- Map nodes -->
            @for (mn of mapNodes(); track mn.node.id) {
              <g class="map-node"
                [class.map-node--completed]="isCompleted(mn.node.id)"
                [class.map-node--current]="isCurrent(mn.node.id)"
                [class.map-node--selected]="selectedNode() != null && selectedNode()!.node.id === mn.node.id"
                (click)="selectNode(mn)"
                style="cursor: pointer"
              >
                <!-- Glow for current -->
                @if (isCurrent(mn.node.id)) {
                  <circle [attr.cx]="mn.x" [attr.cy]="mn.y" r="22"
                    [attr.fill]="mn.pathColor" fill-opacity="0.12"
                    filter="url(#glow)">
                    <animate attributeName="r" values="20;24;20" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="fill-opacity" values="0.12;0.06;0.12" dur="2s" repeatCount="indefinite"/>
                  </circle>
                }
                <!-- Node circle -->
                <circle
                  [attr.cx]="mn.x" [attr.cy]="mn.y" r="18"
                  [attr.fill]="isCompleted(mn.node.id) ? mn.pathColor : 'white'"
                  [attr.stroke]="mn.pathColor"
                  stroke-width="2"
                  filter="url(#node-shadow)"
                />
                <!-- Icon / number / check -->
                @if (isCompleted(mn.node.id)) {
                  <text [attr.x]="mn.x" [attr.y]="mn.y"
                    fill="white" font-size="14" font-weight="700"
                    text-anchor="middle" dominant-baseline="central"
                    font-family="Inter, system-ui, sans-serif">✓</text>
                } @else if (isCurrent(mn.node.id)) {
                  <text [attr.x]="mn.x" [attr.y]="mn.y"
                    [attr.fill]="mn.pathColor" font-size="13" font-weight="700"
                    text-anchor="middle" dominant-baseline="central"
                    font-family="Inter, system-ui, sans-serif">▶</text>
                } @else {
                  <text [attr.x]="mn.x" [attr.y]="mn.y"
                    fill="#94a3b8" font-size="10" font-weight="600"
                    text-anchor="middle" dominant-baseline="central"
                    font-family="Inter, system-ui, sans-serif">{{ getOrderedIndex(mn) }}</text>
                }
                <!-- Node label (below circle) -->
                <text
                  [attr.x]="mn.x" [attr.y]="mn.y + 28"
                  fill="#475569" font-size="8" font-weight="500"
                  text-anchor="middle" dominant-baseline="hanging"
                  font-family="Inter, system-ui, sans-serif"
                >
                  <tspan [attr.fill]="isCompleted(mn.node.id) ? '#10b981' : '#475569'" font-weight="600">
                    {{ truncate(mn.node.name, 14) }}
                  </tspan>
                </text>
              </g>
            }

            <!-- Center hub -->
            <circle [attr.cx]="CX" [attr.cy]="CY" r="32" fill="white" stroke="#e2e8f0" stroke-width="2" filter="url(#node-shadow)"/>
            <text [attr.x]="CX" [attr.y]="CY - 4" font-size="20" text-anchor="middle" dominant-baseline="central">🎓</text>
            <text [attr.x]="CX" [attr.y]="CY + 16" font-size="7" font-weight="600" fill="#64748b"
              text-anchor="middle" dominant-baseline="hanging" font-family="Inter, system-ui, sans-serif">
              MI RUTA
            </text>
          </svg>
        </div>

        <!-- ═══════ NODE DETAIL PANEL ═══════ -->
        @if (selectedNode()) {
          <div class="detail-panel" [style.--accent]="selectedNode()!.pathColor">
            <div class="detail-panel__header">
              <div class="detail-panel__title-row">
                <div class="detail-panel__step"
                  [class.detail-panel__step--completed]="isCompleted(selectedNode()!.node.id)"
                  [class.detail-panel__step--current]="isCurrent(selectedNode()!.node.id)">
                  @if (isCompleted(selectedNode()!.node.id)) {
                    <i class="bi bi-check-lg"></i>
                  } @else if (isCurrent(selectedNode()!.node.id)) {
                    <i class="bi bi-play-fill"></i>
                  } @else {
                    {{ getOrderedIndex(selectedNode()!) }}
                  }
                </div>
                <div>
                  <h4 class="detail-panel__name">{{ selectedNode()!.node.name }}</h4>
                  <div class="detail-panel__meta">
                    <span class="tag" [class]="'tag--' + selectedNode()!.node.difficulty">
                      {{ getDifficultyLabel(selectedNode()!.node.difficulty) }}
                    </span>
                    <span class="tag tag--weeks">{{ selectedNode()!.node.estimated_weeks }} semanas</span>
                  </div>
                </div>
              </div>
              <button class="detail-panel__close" (click)="selectedNode.set(null)">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <p class="detail-panel__desc">{{ selectedNode()!.node.description }}</p>

            <!-- Resources -->
            @if (selectedNode()!.node.resources && selectedNode()!.node.resources.length > 0) {
              <div class="detail-panel__resources">
                <h5 class="detail-panel__resources-title">
                  Recursos ({{ selectedNode()!.node.resources.length }})
                </h5>
                <div class="resources-grid">
                  @for (res of selectedNode()!.node.resources; track res.url) {
                    <a class="resource-card" [href]="res.url" target="_blank" rel="noopener">
                      <span class="resource-card__icon" [class]="'resource-card__icon--' + res.type">
                        @switch (res.type) {
                          @case ('course') { <i class="bi bi-book"></i> }
                          @case ('article') { <i class="bi bi-file-text"></i> }
                          @case ('practice') { <i class="bi bi-code-slash"></i> }
                          @case ('tool') { <i class="bi bi-tools"></i> }
                          @case ('book') { <i class="bi bi-book-half"></i> }
                        }
                      </span>
                      <div class="resource-card__info">
                        <span class="resource-card__name">{{ res.name }}</span>
                        <span class="resource-card__desc">{{ res.description }}</span>
                      </div>
                      @if (res.is_free) {
                        <span class="resource-card__free">Gratis</span>
                      }
                    </a>
                  }
                </div>
              </div>
            }

            <!-- Toggle button -->
            <button class="toggle-btn"
              [class.toggle-btn--completed]="isCompleted(selectedNode()!.node.id)"
              (click)="toggleNode(selectedNode()!.node.id)">
              @if (isCompleted(selectedNode()!.node.id)) {
                <i class="bi bi-arrow-counterclockwise mr-1.5"></i>Marcar como pendiente
              } @else {
                <i class="bi bi-check-circle mr-1.5"></i>Marcar como completado
              }
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    /* ═══════════════════════════════════════
       MAP CONTAINER
    ═══════════════════════════════════════ */
    .map-skeleton { width: 100%; height: 360px; background: #f8fafc; border-radius: 1rem; border: 1px solid #e2e8f0; }

    .map-wrapper { font-family: 'Inter', system-ui, sans-serif; }

    .map-container {
      width: 100%; overflow-x: auto; overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent;
      border-radius: 1rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      padding: 0.5rem;
    }
    .map-container::-webkit-scrollbar { height: 4px; }
    .map-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

    .map-svg {
      display: block;
      min-width: 680px;
      width: 100%;
      height: auto;
    }

    /* Node interactions */
    .map-node { transition: transform 0.15s ease; }
    .map-node:hover { transform: scale(1.08); }
    .map-node--selected circle:nth-child(2) { stroke-width: 3; }

    /* ═══════════════════════════════════════
       DETAIL PANEL
    ═══════════════════════════════════════ */
    .detail-panel {
      margin-top: 0.75rem;
      background: white; border: 1px solid #e2e8f0;
      border-radius: 0.875rem; border-left: 3px solid var(--accent, #6366f1);
      padding: 1rem;
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .detail-panel__header {
      display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;
    }
    .detail-panel__title-row { display: flex; gap: 0.625rem; align-items: flex-start; flex: 1; }
    .detail-panel__step {
      width: 2rem; height: 2rem; border-radius: 0.5rem; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #d1d5db; background: white; font-size: 0.75rem; font-weight: 700; color: #94a3b8;
    }
    .detail-panel__step--completed { background: #10b981; border-color: #10b981; color: white; }
    .detail-panel__step--current { border-color: #3b82f6; color: #3b82f6; }
    .detail-panel__name { font-size: 0.9375rem; font-weight: 700; color: #1e293b; margin: 0 0 0.25rem 0; }
    .detail-panel__meta { display: flex; gap: 0.375rem; }
    .detail-panel__close {
      background: none; border: none; color: #94a3b8; cursor: pointer;
      padding: 0.25rem; border-radius: 0.375rem; font-size: 0.875rem;
    }
    .detail-panel__close:hover { background: #f1f5f9; color: #475569; }

    .detail-panel__desc {
      font-size: 0.8125rem; color: #64748b; line-height: 1.5;
      margin: 0.75rem 0;
    }

    .tag {
      font-size: 0.625rem; font-weight: 600;
      padding: 0.125rem 0.5rem; border-radius: 9999px;
    }
    .tag--basic { background: #dbeafe; color: #1d4ed8; }
    .tag--intermediate { background: #fef3c7; color: #b45309; }
    .tag--advanced { background: #fce7f3; color: #be185d; }
    .tag--weeks { background: #f1f5f9; color: #64748b; }

    /* Resources */
    .detail-panel__resources { margin-top: 0.5rem; }
    .detail-panel__resources-title {
      font-size: 0.75rem; font-weight: 600; color: #475569;
      margin: 0 0 0.5rem 0;
    }
    .resources-grid { display: flex; flex-direction: column; gap: 0.375rem; }
    .resource-card {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 0.625rem; background: #f8fafc;
      border: 1px solid #f1f5f9; border-radius: 0.5rem;
      text-decoration: none; transition: all 0.15s ease;
    }
    .resource-card:hover { border-color: #c7d2fe; background: #f5f3ff; }
    .resource-card__icon {
      width: 1.5rem; height: 1.5rem; border-radius: 0.25rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.6875rem; flex-shrink: 0;
    }
    .resource-card__icon--course { background: #dbeafe; color: #2563eb; }
    .resource-card__icon--article { background: #dcfce7; color: #16a34a; }
    .resource-card__icon--practice { background: #fef3c7; color: #d97706; }
    .resource-card__icon--tool { background: #e0e7ff; color: #4f46e5; }
    .resource-card__icon--book { background: #fce7f3; color: #db2777; }
    .resource-card__info { flex: 1; min-width: 0; }
    .resource-card__name { display: block; font-size: 0.75rem; font-weight: 600; color: #1e293b; }
    .resource-card__desc { display: block; font-size: 0.625rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .resource-card__free {
      font-size: 0.5625rem; font-weight: 600; padding: 0.0625rem 0.375rem;
      border-radius: 9999px; background: #dcfce7; color: #166534; flex-shrink: 0;
    }

    /* Toggle button */
    .toggle-btn {
      width: 100%; margin-top: 0.75rem; padding: 0.5rem;
      border-radius: 0.5rem; border: 1px solid #e2e8f0;
      background: white; color: #475569; font-size: 0.8125rem; font-weight: 600;
      cursor: pointer; transition: all 0.15s ease;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .toggle-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
    .toggle-btn--completed { color: #10b981; border-color: #bbf7d0; background: #f0fdf4; }
    .toggle-btn--completed:hover { background: #dcfce7; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningMapComponent implements OnInit {
  private readonly learningApi = inject(LearningApiService);
  private readonly authStorage = inject(AuthStorageService);

  // SVG dimensions
  readonly SVG_W = 700;
  readonly SVG_H = 420;
  readonly CX = 350;
  readonly CY = 210;

  // 5 paths positioned around the hub
  readonly spokeConfigs: SpokeConfig[] = [
    { angle: 90,   color: '#8b5cf6', label: 'IA',       icon: 'bi-robot' },      // bottom
    { angle: 162,  color: '#6366f1', label: 'Backend',  icon: 'bi-server' },     // bottom-left
    { angle: 234,  color: '#06b6d4', label: 'Frontend', icon: 'bi-window' },     // top-left
    { angle: 306,  color: '#0ea5e9', label: 'Cloud',    icon: 'bi-cloud' },      // top-right
    { angle: 18,   color: '#64748b', label: 'General',  icon: 'bi-grid' },       // right
  ];

  readonly allPaths = signal<LearningPath[]>([]);
  readonly progressMap = signal<Record<string, number>>({});
  readonly completedNodeIds = signal<string[]>([]);
  readonly currentNodeId = signal<string | null>(null);
  readonly isLoading = signal(true);
  readonly selectedNode = signal<MapNode | null>(null);

  readonly mapNodes = computed(() => {
    const paths = this.allPaths();
    if (!paths.length) return [];

    const nodes: MapNode[] = [];
    const distances = [80, 130, 180, 230, 275, 315, 345]; // distance from center per node index

    paths.forEach((path, pathIdx) => {
      if (pathIdx >= this.spokeConfigs.length) return;
      const spoke = this.spokeConfigs[pathIdx];
      const sorted = [...path.nodes].sort((a, b) => a.order - b.order);

      sorted.forEach((node, nodeIdx) => {
        const dist = distances[nodeIdx] ?? 345;
        const rad = (spoke.angle * Math.PI) / 180;
        nodes.push({
          node,
          x: this.CX + dist * Math.cos(rad),
          y: this.CY - dist * Math.sin(rad),
          pathColor: spoke.color,
          goalId: path.goal_id,
        });
      });
    });

    return nodes;
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
        this.loadProgress();
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private loadProgress(): void {
    const userId = this.authStorage.getUserId();
    if (!userId) return;
    this.learningApi.getProgress(userId).subscribe({
      next: (data) => {
        const map: Record<string, number> = {};
        for (const rec of data.progress) {
          map[rec.goal_id] = rec.progress_percent;
        }
        this.progressMap.set(map);

        // Set completed/current from first path with progress
        const active = data.progress.find(p => p.progress_percent > 0 && p.progress_percent < 100)
          ?? data.progress[0];
        if (active) {
          this.completedNodeIds.set(active.completed_nodes ?? []);
          this.currentNodeId.set(active.current_node ?? null);
        }
      },
    });
  }

  getSpokeEndX(angle: number): number {
    const rad = (angle * Math.PI) / 180;
    return this.CX + 370 * Math.cos(rad);
  }

  getSpokeEndY(angle: number): number {
    const rad = (angle * Math.PI) / 180;
    return this.CY - 370 * Math.sin(rad);
  }

  getPathNodes(pathIdx: number): MapNode[] {
    return this.mapNodes().filter(m => {
      const paths = this.allPaths();
      if (!paths[pathIdx]) return false;
      return m.goalId === paths[pathIdx].goal_id;
    });
  }

  selectNode(mn: MapNode): void {
    this.selectedNode.set(this.selectedNode()?.node.id === mn.node.id ? null : mn);
    // Also set active path progress
    this.loadProgressForPath(mn.goalId);
  }

  private loadProgressForPath(goalId: string): void {
    const userId = this.authStorage.getUserId();
    if (!userId) return;
    this.learningApi.getProgress(userId).subscribe({
      next: (data) => {
        const rec = data.progress.find(p => p.goal_id === goalId);
        this.completedNodeIds.set(rec?.completed_nodes ?? []);
        this.currentNodeId.set(rec?.current_node ?? null);
      },
    });
  }

  toggleNode(nodeId: string): void {
    const userId = this.authStorage.getUserId();
    const mn = this.selectedNode();
    if (!userId || !mn) return;

    const wasCompleted = this.isCompleted(nodeId);
    if (wasCompleted) {
      this.completedNodeIds.update(ids => ids.filter(id => id !== nodeId));
    } else {
      this.completedNodeIds.update(ids => [...ids, nodeId]);
    }

    this.learningApi.toggleNode(userId, mn.goalId, nodeId, !wasCompleted).subscribe({
      error: () => {
        if (wasCompleted) {
          this.completedNodeIds.update(ids => [...ids, nodeId]);
        } else {
          this.completedNodeIds.update(ids => ids.filter(id => id !== nodeId));
        }
      },
    });
  }

  isCompleted(nodeId: string): boolean {
    return this.completedNodeIds().includes(nodeId);
  }

  isCurrent(nodeId: string): boolean {
    return this.currentNodeId() === nodeId && !this.isCompleted(nodeId);
  }

  getOrderedIndex(mn: MapNode): number {
    const pathNodes = this.getPathNodes(this.spokeConfigs.findIndex(s =>
      this.allPaths().find(p => p.goal_id === mn.goalId && s.label.toLowerCase() === mn.goalId.toLowerCase())
    ));
    const idx = pathNodes.findIndex(n => n.node.id === mn.node.id);
    return idx >= 0 ? idx + 1 : 0;
  }

  getDifficultyLabel(d: string): string {
    const map: Record<string, string> = { basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado' };
    return map[d] ?? d;
  }

  truncate(text: string, max: number): string {
    return text.length > max ? text.slice(0, max) + '…' : text;
  }
}
