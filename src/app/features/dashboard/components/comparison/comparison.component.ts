import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { MarketApiService } from '@features/home/services/market-api.service';
import { take } from 'rxjs';

interface ComparisonOption {
  label: string;
  title: string;
  subtitle: string;
  accent: 'indigo' | 'emerald';
  salary: string;
  growth: string;
  stack: ReadonlyArray<string>;
  projectionBars: ReadonlyArray<number>;
}

interface MetricRow {
  metric: string;
  optionA: string;
  optionB: string;
  outcome: string;
  tone: 'neutral' | 'indigo' | 'emerald';
}

@Component({
  selector: 'itera-comparison-panel',
  standalone: true,
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparisonComponent implements OnInit {
  private readonly marketApi = inject(MarketApiService);
  
  protected readonly title = 'Path Comparator';
  protected readonly subtitle =
    'A deep-dive analytical comparison between your top two potential career pivots. Leverage data-driven growth projections and cost-benefit analysis.';

  readonly options = signal<ReadonlyArray<ComparisonOption>>([]);
  readonly metricRows = signal<ReadonlyArray<MetricRow>>([]);

  ngOnInit(): void {
    this.marketApi.getCareerMetrics().pipe(take(1)).subscribe(metrics => {
      if (metrics.length >= 2) {
        const m1 = metrics[0];
        const m2 = metrics[1];

        const mappedOptions: ComparisonOption[] = [m1, m2].map((m, i) => ({
          label: `Option ${i === 0 ? 'A' : 'B'}`,
          title: m.titulo_carrera,
          subtitle: `Specializing in ${m.aprendizaje.habilidades_top.slice(0, 2).join(' & ')}.`,
          accent: i === 0 ? 'indigo' : 'emerald',
          salary: `$${m.salario_anual_usd.mediana.toLocaleString()}`,
          growth: m.demanda_mercado.tendencia === 'creciente' ? '+15%' : '+5%',
          stack: m.aprendizaje.habilidades_top,
          projectionBars: [15, 25, 40, 50, 60]
        }));
        this.options.set(mappedOptions);

        const mappedRows: MetricRow[] = [
          {
            metric: 'Total Learning Time',
            optionA: `${m1.aprendizaje.tiempo_estimado_upgrading_meses} Months`,
            optionB: `${m2.aprendizaje.tiempo_estimado_upgrading_meses} Months`,
            outcome: m1.aprendizaje.tiempo_estimado_upgrading_meses < m2.aprendizaje.tiempo_estimado_upgrading_meses ? 'Faster pivot' : 'Longer path',
            tone: 'indigo',
          },
          {
            metric: 'Entry Difficulty',
            optionA: `${m1.analisis_competitivo.dificultad_entrada}/10`,
            optionB: `${m2.analisis_competitivo.dificultad_entrada}/10`,
            outcome: m1.analisis_competitivo.dificultad_entrada < m2.analisis_competitivo.dificultad_entrada ? 'Lower barrier' : 'High barrier',
            tone: 'emerald',
          }
        ];
        this.metricRows.set(mappedRows);
      }
    });
  }

  protected readonly mentorSummary =
    'Based on the current market data, both paths offer significant growth. Option A provides a faster entry to the market with lower initial difficulty.';
}
