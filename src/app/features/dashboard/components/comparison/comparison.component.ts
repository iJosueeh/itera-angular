import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MarketApiService, SalarySnapshotResponse } from '@features/home/services/market-api.service';
import { ProfileContentService } from '@features/profile/services/profile-content.service';
import { AuthStorageService } from '@shared/services/auth-storage.service';
import { CareerMetrics } from '@shared/interfaces/market.interface';
import { Subscription, firstValueFrom, forkJoin } from 'rxjs';

interface ComparisonOption {
  label: string;
  title: string;
  subtitle: string;
  accent: 'primary' | 'secondary';
  salary: string;
  salaryRaw: number;
  growth: string;
  growthLabel: string;
  stack: ReadonlyArray<string>;
  preparationMonths: number;
  topCompanies: ReadonlyArray<string>;
  projectionBars: ReadonlyArray<{ year: number; height: number; salary: number }>;
}

interface MetricRow {
  metric: string;
  optionA: string;
  optionB: string;
  outcome: string;
  tone: 'neutral' | 'primary' | 'secondary';
}

/** Maps titulo_carrera → academicGoal ID */
const CAREER_TO_GOAL: Record<string, string> = {
  'Desarrollo Backend': 'Backend',
  'Ciencia de Datos e IA': 'AI',
  'Datos y Business Intelligence': 'AI',
  'Ingeniería de Datos': 'AI',
  'Infraestructura y Cloud': 'Cloud',
  'Infraestructura y Sistemas': 'Cloud',
  'DevOps y Cloud': 'Cloud',
  'DevOps y SRE': 'Cloud',
  'Desarrollo Frontend': 'Frontend',
  'Desarrollo Fullstack': 'Frontend',
};

@Component({
  selector: 'itera-comparison-panel',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparisonComponent implements OnInit, OnDestroy {
  private readonly marketApi = inject(MarketApiService);
  private readonly profileContentService = inject(ProfileContentService);
  private readonly authStorage = inject(AuthStorageService);

  protected readonly title = 'Comparador de Rutas';
  protected readonly subtitle =
    'Selecciona dos carreras para comparar salario, demanda y proyección. Basado en datos reales de mercado.';

  // ── Data ──
  private readonly allMetrics = signal<ReadonlyArray<CareerMetrics>>([]);
  private readonly snapshots = signal<SalarySnapshotResponse | null>(null);
  protected readonly isLoadingData = signal(true);
  protected readonly isUpdatingGoal = signal(false);
  protected readonly goalUpdateMessage = signal<string | null>(null);

  // ── Selection ──
  readonly selectedIndexA = signal<number>(0);
  readonly selectedIndexB = signal<number>(1);

  // ── Derived ──
  readonly hasEnoughData = computed(() => this.allMetrics().length >= 2);

  readonly availableCareers = computed(() =>
    this.allMetrics().map((m) => ({
      title: m.titulo_carrera,
      goalId: CAREER_TO_GOAL[m.titulo_carrera] ?? null,
    })),
  );

  readonly userGoal = computed(() => {
    return this.profileContentService.profile()?.academicGoal ?? 'General';
  });

  readonly options = computed<ReadonlyArray<ComparisonOption>>(() => {
    const metrics = this.allMetrics();
    const idxA = this.selectedIndexA();
    const idxB = this.selectedIndexB();
    const snap = this.snapshots();

    if (metrics.length < 2) return [];

    const m1 = metrics[idxA];
    const m2 = metrics[idxB];

    return [m1, m2].map((m, i) => {
      const accent = i === 0 ? ('primary' as const) : ('secondary' as const);
      const salaryAvg = m.salario_anual_usd.promedio || 0;
      const tendencia = m.demanda_mercado.tendencia;
      const growthPercent = tendencia === 'creciente' ? 15 : tendencia === 'estable' ? 5 : -3;

      // Projection bars from snapshots
      let projectionBars: ReadonlyArray<{ year: number; height: number; salary: number }> = [];
      if (snap?.snapshots[m.titulo_carrera]) {
        const careerSnaps = snap.snapshots[m.titulo_carrera];
        const maxSalary = Math.max(...careerSnaps.map((s) => s.salario_promedio), 1);
        projectionBars = careerSnaps.map((s) => ({
          year: s.year,
          height: (s.salario_promedio / maxSalary) * 100,
          salary: s.salario_promedio,
        }));
      }

      return {
        label: `Opción ${i === 0 ? 'A' : 'B'}`,
        title: m.titulo_carrera,
        subtitle:
          m.analisis_competitivo.top_empresas.length > 0
            ? `Demanda liderada por ${m.analisis_competitivo.top_empresas.slice(0, 2).join(' y ')}.`
            : `Especialización en ${m.aprendizaje.habilidades_clave.slice(0, 2).join(' y ')}.`,
        accent,
        salary: `$${salaryAvg.toLocaleString()}`,
        salaryRaw: salaryAvg,
        growth: growthPercent > 0 ? `+${growthPercent}%` : `${growthPercent}%`,
        growthLabel: tendencia === 'creciente' ? 'Creciente' : tendencia === 'estable' ? 'Estable' : 'En reducción',
        stack: m.aprendizaje.habilidades_clave,
        preparationMonths: m.aprendizaje.tiempo_estimado_upgrading_meses ?? 12,
        topCompanies: m.analisis_competitivo.top_empresas,
        projectionBars,
      };
    });
  });

  readonly metricRows = computed<ReadonlyArray<MetricRow>>(() => {
    const metrics = this.allMetrics();
    const idxA = this.selectedIndexA();
    const idxB = this.selectedIndexB();

    if (metrics.length < 2) return [];

    const m1 = metrics[idxA];
    const m2 = metrics[idxB];

    const t1 = m1.aprendizaje.tiempo_estimado_upgrading_meses ?? 12;
    const t2 = m2.aprendizaje.tiempo_estimado_upgrading_meses ?? 14;
    const v1 = m1.demanda_mercado.volumen_total;
    const v2 = m2.demanda_mercado.volumen_total;
    const s1 = m1.salario_anual_usd.promedio;
    const s2 = m2.salario_anual_usd.promedio;

    return [
      {
        metric: 'Tiempo de Preparación',
        optionA: `${t1} Meses`,
        optionB: `${t2} Meses`,
        outcome: t1 < t2 ? 'Pivotaje Rápido' : t1 > t2 ? 'Ruta Profunda' : 'Similar',
        tone: t1 < t2 ? 'primary' : t1 > t2 ? 'secondary' : 'neutral',
      },
      {
        metric: 'Salario Promedio',
        optionA: `$${s1.toLocaleString()}`,
        optionB: `$${s2.toLocaleString()}`,
        outcome: s1 > s2 ? 'Mayor Salario' : s2 > s1 ? 'Mayor Salario' : 'Iguales',
        tone: s1 > s2 ? 'primary' : s2 > s1 ? 'secondary' : 'neutral',
      },
      {
        metric: 'Demanda de Mercado',
        optionA: `${v1} Vacantes`,
        optionB: `${v2} Vacantes`,
        outcome: v1 > v2 ? 'Alta Demanda' : v2 > v1 ? 'Alta Demanda' : 'Similar',
        tone: v1 > v2 ? 'primary' : v2 > v1 ? 'secondary' : 'neutral',
      },
      {
        metric: 'Empresas Top',
        optionA: m1.analisis_competitivo.top_empresas[0] ?? 'Varias',
        optionB: m2.analisis_competitivo.top_empresas[0] ?? 'Varias',
        outcome: 'Empresas Reales',
        tone: 'neutral',
      },
      {
        metric: 'Tendencia',
        optionA: m1.demanda_mercado.tendencia === 'creciente' ? '📈 Creciente' : m1.demanda_mercado.tendencia === 'estable' ? '➡️ Estable' : '📉 Bajante',
        optionB: m2.demanda_mercado.tendencia === 'creciente' ? '📈 Creciente' : m2.demanda_mercado.tendencia === 'estable' ? '➡️ Estable' : '📉 Bajante',
        outcome:
          m1.demanda_mercado.tendencia === 'creciente' && m2.demanda_mercado.tendencia !== 'creciente'
            ? 'Mejor Perspectiva'
            : m2.demanda_mercado.tendencia === 'creciente' && m1.demanda_mercado.tendencia !== 'creciente'
              ? 'Mejor Perspectiva'
              : 'Ambas Estables',
        tone:
          m1.demanda_mercado.tendencia === 'creciente' && m2.demanda_mercado.tendencia !== 'creciente'
            ? 'primary'
            : m2.demanda_mercado.tendencia === 'creciente' && m1.demanda_mercado.tendencia !== 'creciente'
              ? 'secondary'
              : 'neutral',
      },
    ];
  });

  readonly mentorSummary = computed(() => {
    const opts = this.options();
    if (opts.length < 2) return 'Selecciona dos carreras para ver el análisis del mentor.';

    const [a, b] = opts;
    const parts: string[] = [];

    // Salary comparison
    if (a.salaryRaw > b.salaryRaw) {
      const diff = Math.round(((a.salaryRaw - b.salaryRaw) / b.salaryRaw) * 100);
      parts.push(`${a.title} ofrece un ${diff}% más de salario promedio`);
    } else if (b.salaryRaw > a.salaryRaw) {
      const diff = Math.round(((b.salaryRaw - a.salaryRaw) / a.salaryRaw) * 100);
      parts.push(`${b.title} ofrece un ${diff}% más de salario promedio`);
    } else {
      parts.push('Ambas carreras tienen un salario promedio similar');
    }

    // Preparation time
    if (a.preparationMonths < b.preparationMonths) {
      parts.push(`${a.title} permite un ingreso más rápido al mercado (${a.preparationMonths} meses vs ${b.preparationMonths})`);
    } else if (b.preparationMonths < a.preparationMonths) {
      parts.push(`${b.title} permite un ingreso más rápido al mercado (${b.preparationMonths} meses vs ${a.preparationMonths})`);
    }

    // Growth
    if (a.growthLabel === 'Creciente' && b.growthLabel !== 'Creciente') {
      parts.push(`${a.title} tiene una demanda en crecimiento constante`);
    } else if (b.growthLabel === 'Creciente' && a.growthLabel !== 'Creciente') {
      parts.push(`${b.title} tiene una demanda en crecimiento constante`);
    }

    return parts.join('. ') + '. Evalúa tu tiempo disponible y objetivos para tomar la mejor decisión.';
  });

  // ── Subscriptions ──
  private dataSub?: Subscription;

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.dataSub?.unsubscribe();
  }

  private loadData(): void {
    this.isLoadingData.set(true);

    this.dataSub = forkJoin({
      metrics: this.marketApi.getCareerMetrics(),
      snapshots: this.marketApi.getSalarySnapshots(undefined, 2),
    }).subscribe({
      next: ({ metrics, snapshots }) => {
        this.allMetrics.set(metrics);

        // Set default selection: user's goal career first, highest volume second
        const userGoal = this.profileContentService.profile()?.academicGoal ?? 'General';
        const defaultIdxA = this.findCareerIndexByGoal(metrics, userGoal) ?? 0;
        const defaultIdxB = this.findHighestVolumeIndex(metrics, defaultIdxA);

        this.selectedIndexA.set(defaultIdxA);
        this.selectedIndexB.set(defaultIdxB);

        this.snapshots.set(snapshots);
        this.isLoadingData.set(false);
      },
      error: (err) => {
        console.error('[Comparison] Error loading data:', err);
        this.isLoadingData.set(false);
      },
    });
  }

  private findCareerIndexByGoal(metrics: ReadonlyArray<CareerMetrics>, goalId: string): number | null {
    if (goalId === 'General') return null;
    const idx = metrics.findIndex((m) => CAREER_TO_GOAL[m.titulo_carrera] === goalId);
    return idx >= 0 ? idx : null;
  }

  private findHighestVolumeIndex(metrics: ReadonlyArray<CareerMetrics>, excludeIdx: number): number {
    let bestIdx = excludeIdx === 0 ? 1 : 0;
    let bestVolume = metrics[bestIdx]?.demanda_mercado.volumen_total ?? 0;

    for (let i = 0; i < metrics.length; i++) {
      if (i === excludeIdx) continue;
      const vol = metrics[i].demanda_mercado.volumen_total;
      if (vol > bestVolume) {
        bestVolume = vol;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  // ── User Actions ──

  protected onSelectA(index: number): void {
    if (index === this.selectedIndexB()) {
      // Swap if same as B
      this.selectedIndexB.set(this.selectedIndexA());
    }
    this.selectedIndexA.set(index);
  }

  protected onSelectB(index: number): void {
    if (index === this.selectedIndexA()) {
      // Swap if same as A
      this.selectedIndexA.set(this.selectedIndexB());
    }
    this.selectedIndexB.set(index);
  }

  protected async chooseRoute(optionIndex: number): Promise<void> {
    const opts = this.options();
    if (!opts[optionIndex]) return;

    const careerTitle = opts[optionIndex].title;
    const goalId = CAREER_TO_GOAL[careerTitle];

    if (!goalId) {
      this.goalUpdateMessage.set(`No se encontró una ruta de aprendizaje para "${careerTitle}".`);
      setTimeout(() => this.goalUpdateMessage.set(null), 4000);
      return;
    }

    if (this.userGoal() === goalId) {
      this.goalUpdateMessage.set(`Ya estás en la ruta "${goalId}".`);
      setTimeout(() => this.goalUpdateMessage.set(null), 3000);
      return;
    }

    this.isUpdatingGoal.set(true);
    this.goalUpdateMessage.set(null);

    try {
      await firstValueFrom(this.profileContentService.updateAcademicGoal(goalId));
      this.goalUpdateMessage.set(`¡Ruta actualizada a "${goalId}"! Tu perfil y progreso se han actualizado.`);
    } catch {
      this.goalUpdateMessage.set('Error al actualizar la ruta. Intenta de nuevo.');
    } finally {
      this.isUpdatingGoal.set(false);
      setTimeout(() => this.goalUpdateMessage.set(null), 5000);
    }
  }

  protected scrollToSelectors(): void {
    document.getElementById('career-selectors')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  protected getGoalId(careerTitle: string): string | null {
    return CAREER_TO_GOAL[careerTitle] ?? null;
  }

  protected isUserGoal(careerTitle: string): boolean {
    return CAREER_TO_GOAL[careerTitle] === this.userGoal();
  }
}
