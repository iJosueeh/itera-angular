import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
import { CareerMetrics } from '@shared/interfaces/market.interface';

@Component({
  selector: 'itera-career-card',
  standalone: true,
  templateUrl: './career-card.component.html',
  styleUrl: './career-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerCardComponent {
  readonly career = input.required<CareerMetrics>();
  readonly variant = input<'compact' | 'expanded'>('compact');
  readonly showSkills = input<boolean>(true);
  readonly clickable = input<boolean>(true);

  readonly cardClick = output<CareerMetrics>();

  protected readonly salaryRange = computed(() => {
    const c = this.career();
    const min = Math.floor((c.salario_anual_usd.min || 0) / 1000);
    const max = Math.floor((c.salario_anual_usd.max || 0) / 1000);
    return { min, max, formatted: `$${min}k - $${max}k` };
  });

  protected readonly demandInfo = computed(() => {
    const c = this.career();
    const volume = c.demanda_mercado.volumen_total || 0;
    const trend = c.demanda_mercado.tendencia;

    let level: string;
    let color: string;

    if (volume > 50) {
      level = 'Muy Alta';
      color = 'text-success';
    } else if (volume > 15) {
      level = 'Alta';
      color = 'text-primary';
    } else if (volume > 0) {
      level = 'Creciente';
      color = 'text-accent';
    } else {
      level = 'Estable';
      color = 'text-white/50';
    }

    return { volume, trend, level, color };
  });

  protected readonly topSkills = computed(() => {
    const skills = this.career().aprendizaje?.habilidades_clave || [];
    return skills.slice(0, 3);
  });

  protected readonly trendIcon = computed(() => {
    return this.career().demanda_mercado.tendencia === 'creciente' ? 'bi-arrow-up-right' : 'bi-dash';
  });

  onCardClick(): void {
    if (this.clickable()) {
      this.cardClick.emit(this.career());
    }
  }
}
