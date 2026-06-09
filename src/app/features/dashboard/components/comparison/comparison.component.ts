import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { MarketApiService } from '@features/home/services/market-api.service';
import { take } from 'rxjs';

interface ComparisonOption {
  label: string;
  title: string;
  subtitle: string;
  accent: 'primary' | 'secondary';
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
  tone: 'neutral' | 'primary' | 'secondary';
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

  protected readonly title = 'Comparador de Rutas';
  protected readonly subtitle =
    'Un análisis técnico profundo entre tus dos mejores opciones de crecimiento. Basado en volúmenes de mercado y proyecciones de Itera AI.';

  readonly options = signal<ReadonlyArray<ComparisonOption>>([]);
  readonly metricRows = signal<ReadonlyArray<MetricRow>>([]);

  ngOnInit(): void {
    this.marketApi
      .getCareerMetrics()
      .pipe(take(1))
      .subscribe((metrics) => {
        if (metrics.length >= 2) {
          const m1 = metrics[0];
          const m2 = metrics[1];

          const mappedOptions: ComparisonOption[] = [m1, m2].map((m, i) => ({
            label: `Opción ${i === 0 ? 'A' : 'B'}`,
            title: m.titulo_carrera,
            subtitle:
              m.analisis_competitivo.top_empresas.length > 0
                ? `Demanda liderada por ${m.analisis_competitivo.top_empresas.slice(0, 2).join(' y ')}.`
                : `Especialización en ${m.aprendizaje.habilidades_clave.slice(0, 2).join(' y ')}.`,
            accent: i === 0 ? 'primary' : 'secondary',
            salary: `$${(m.salario_anual_usd.promedio || 0).toLocaleString()}`,
            growth: m.demanda_mercado.tendencia === 'creciente' ? '+15%' : '+5%',
            stack: m.aprendizaje.habilidades_clave,
            projectionBars: [15, 25, 40, 50, 60],
          }));
          this.options.set(mappedOptions);

          const mappedRows: MetricRow[] = [
            {
              metric: 'Tiempo de Preparación',
              optionA: `${m1.aprendizaje.tiempo_estimado_upgrading_meses ?? 12} Meses`,
              optionB: `${m2.aprendizaje.tiempo_estimado_upgrading_meses ?? 14} Meses`,
              outcome:
                (m1.aprendizaje.tiempo_estimado_upgrading_meses ?? 12) <
                (m2.aprendizaje.tiempo_estimado_upgrading_meses ?? 14)
                  ? 'Pivotaje Rápido'
                  : 'Ruta Profunda',
              tone: 'primary',
            },
            {
              metric: 'Demanda de Mercado',
              optionA: `${m1.demanda_mercado.volumen_total} Vacantes`,
              optionB: `${m2.demanda_mercado.volumen_total} Vacantes`,
              outcome:
                m1.demanda_mercado.volumen_total > m2.demanda_mercado.volumen_total
                  ? 'Alta Demanda'
                  : 'Nicho Técnico',
              tone: 'secondary',
            },
            {
              metric: 'Empresas Top',
              optionA: m1.analisis_competitivo.top_empresas[0] ?? 'Varias',
              optionB: m2.analisis_competitivo.top_empresas[0] ?? 'Varias',
              outcome: 'Empresas Reales',
              tone: 'neutral',
            },
          ];
          this.metricRows.set(mappedRows);
        }
      });
  }

  protected readonly mentorSummary =
    'Basado en los datos actuales, ambas rutas ofrecen un crecimiento sólido. La Opción A permite un ingreso más rápido al mercado laboral con una curva de aprendizaje menor.';
}
