import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  ROADMAP_PATHS,
  getRoadmapForGoal,
  RoadmapPath,
  RoadmapNode,
  RoadmapStatus,
} from './roadmap-data';

@Component({
  selector: 'itera-interactive-roadmap',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="roadmap-container">
      <!-- Header con título y progreso -->
      <div class="roadmap-header">
        <div class="roadmap-info">
          <h3 class="roadmap-title" [style.color]="roadmap().color">
            {{ roadmap().title }}
          </h3>
          <p class="roadmap-subtitle">{{ roadmap().subtitle }}</p>
        </div>
        <div class="roadmap-progress">
          <div class="progress-circle">
            <svg viewBox="0 0 36 36" class="circular-chart">
              <path
                class="circle-bg"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="circle-fg"
                [attr.stroke]="roadmap().color"
                [attr.stroke-dasharray]="progressPercent() + ', 100'"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span class="progress-text">{{ progressPercent() }}%</span>
          </div>
        </div>
      </div>

      <!-- Timeline de nodos -->
      <div class="roadmap-timeline">
        @for (node of roadmap().nodes; track node.id; let i = $index; let last = $last) {
          <div
            class="timeline-item"
            [class.completed]="node.status === 'completed'"
            [class.in-progress]="node.status === 'in-progress'"
            [class.planned]="node.status === 'planned'"
          >
            <!-- Connector line -->
            @if (!last) {
              <div
                class="timeline-connector"
                [class.active]="node.status === 'completed' || node.status === 'in-progress'"
              ></div>
            }

            <!-- Node card -->
            <div class="timeline-node" [class]="'status-' + node.status">
              <div class="node-icon" [style.background-color]="getNodeColor(node.status)">
                <i [class]="'bi ' + node.icon"></i>
              </div>
              <div class="node-content">
                <div class="node-header">
                  <h4 class="node-name">{{ node.name }}</h4>
                  <span class="node-difficulty" [class]="'diff-' + node.difficulty">
                    {{ getDifficultyLabel(node.difficulty) }}
                  </span>
                </div>
                <p class="node-description">{{ node.description }}</p>
                <div class="node-footer">
                  <span class="node-duration">
                    <i class="bi bi-clock"></i>
                    {{ node.duration }}
                  </span>
                  <span class="node-status-badge" [class]="'badge-' + node.status">
                    {{ getStatusLabel(node.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Resumen de progreso -->
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
          <span>{{ plannedCount() }} planificados</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .roadmap-container {
        font-family: 'Inter', system-ui, sans-serif;
      }

      .roadmap-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .roadmap-title {
        font-size: 1.125rem;
        font-weight: 700;
        margin: 0 0 0.25rem 0;
      }

      .roadmap-subtitle {
        font-size: 0.75rem;
        color: #64748b;
        margin: 0;
      }

      .roadmap-progress {
        display: flex;
        align-items: center;
      }

      .progress-circle {
        position: relative;
        width: 3rem;
        height: 3rem;
      }

      .circular-chart {
        width: 100%;
        height: 100%;
      }

      .circle-bg {
        fill: none;
        stroke: #e2e8f0;
        stroke-width: 3;
      }

      .circle-fg {
        fill: none;
        stroke-width: 3;
        stroke-linecap: round;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
        transition: stroke-dasharray 0.5s ease;
      }

      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.625rem;
        font-weight: 700;
        color: #1e293b;
      }

      .roadmap-timeline {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .timeline-item {
        display: flex;
        gap: 1rem;
        position: relative;
      }

      .timeline-connector {
        position: absolute;
        left: 1.25rem;
        top: 3rem;
        width: 2px;
        height: calc(100% - 1rem);
        background: #e2e8f0;
        transition: background 0.3s ease;
      }

      .timeline-connector.active {
        background: #10b981;
      }

      .timeline-node {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 0.75rem;
        border: 1px solid #e2e8f0;
        margin-bottom: 0.75rem;
        transition: all 0.2s ease;
        flex: 1;
      }

      .timeline-node:hover {
        border-color: #cbd5e1;
        transform: translateX(4px);
      }

      .timeline-node.status-completed {
        background: #f0fdf4;
        border-color: #bbf7d0;
      }

      .timeline-node.status-in-progress {
        background: #eff6ff;
        border-color: #bfdbfe;
        border-left: 3px solid #3b82f6;
      }

      .timeline-node.status-planned {
        opacity: 0.75;
      }

      .timeline-node.status-attention {
        background: #fef2f2;
        border-color: #fecaca;
        border-left: 3px solid #ef4444;
      }

      .node-icon {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1rem;
        flex-shrink: 0;
      }

      .node-content {
        flex: 1;
        min-width: 0;
      }

      .node-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
      }

      .node-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
      }

      .node-difficulty {
        font-size: 0.625rem;
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        text-transform: uppercase;
      }

      .diff-basic {
        background: #dbeafe;
        color: #1d4ed8;
      }

      .diff-intermediate {
        background: #fef3c7;
        color: #b45309;
      }

      .diff-advanced {
        background: #fce7f3;
        color: #be185d;
      }

      .node-description {
        font-size: 0.75rem;
        color: #64748b;
        margin: 0 0 0.5rem 0;
        line-height: 1.4;
      }

      .node-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .node-duration {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.6875rem;
        color: #94a3b8;
      }

      .node-duration i {
        font-size: 0.75rem;
      }

      .node-status-badge {
        font-size: 0.625rem;
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        text-transform: uppercase;
      }

      .badge-completed {
        background: #dcfce7;
        color: #166534;
      }

      .badge-in-progress {
        background: #dbeafe;
        color: #1e40af;
      }

      .badge-planned {
        background: #f1f5f9;
        color: #475569;
      }

      .badge-attention {
        background: #fee2e2;
        color: #991b1b;
      }

      .roadmap-summary {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
      }

      .summary-item {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .summary-item i {
        font-size: 0.875rem;
      }

      .summary-item.completed {
        color: #10b981;
      }

      .summary-item.in-progress {
        color: #3b82f6;
      }

      .summary-item.planned {
        color: #64748b;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InteractiveRoadmapComponent {
  academicGoal = input<string>('General');

  roadmap = computed(() => getRoadmapForGoal(this.academicGoal()));

  progressPercent = computed(() => {
    const nodes = this.roadmap().nodes;
    const completed = nodes.filter((n) => n.status === 'completed').length;
    return Math.round((completed / nodes.length) * 100);
  });

  completedCount = computed(
    () => this.roadmap().nodes.filter((n) => n.status === 'completed').length,
  );

  inProgressCount = computed(
    () => this.roadmap().nodes.filter((n) => n.status === 'in-progress').length,
  );

  plannedCount = computed(() => this.roadmap().nodes.filter((n) => n.status === 'planned').length);

  getNodeColor(status: RoadmapStatus): string {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#3b82f6';
      case 'attention':
        return '#ef4444';
      default:
        return '#94a3b8';
    }
  }

  getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
      case 'basic':
        return 'Básico';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return difficulty;
    }
  }

  getStatusLabel(status: RoadmapStatus): string {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in-progress':
        return 'En Progreso';
      case 'attention':
        return 'Requiere Atención';
      default:
        return 'Planificado';
    }
  }
}
