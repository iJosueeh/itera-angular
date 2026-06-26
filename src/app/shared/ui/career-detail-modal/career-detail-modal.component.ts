import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CareerMetrics } from '@shared/interfaces/market.interface';

@Component({
  selector: 'itera-career-detail-modal',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './career-detail-modal.component.html',
  styleUrl: './career-detail-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'dialog',
    '[attr.aria-label]': '"Detalles de " + career().titulo_carrera',
    '(click)': 'onBackdropClick($event)',
    '(keydown.escape)': 'close.emit()',
  },
})
export class CareerDetailModalComponent {
  readonly career = input.required<CareerMetrics>();
  readonly allCareers = input<CareerMetrics[]>([]);
  readonly close = output<void>();

  protected get demandLevel(): string {
    const volume = this.career().demanda_mercado.volumen_total || 0;
    if (volume > 50) return 'Muy Alta';
    if (volume > 15) return 'Alta';
    if (volume > 0) return 'En Crecimiento';
    return 'Estable';
  }

  protected get trendLabel(): string {
    return this.career().demanda_mercado.tendencia === 'creciente'
      ? 'Alta'
      : this.career().demanda_mercado.tendencia === 'decreciente'
        ? 'Baja'
        : 'Estable';
  }

  protected get salaryMin(): string {
    return `$${Math.floor((this.career().salario_anual_usd.min || 0) / 1000)}k`;
  }

  protected get salaryMax(): string {
    return `$${Math.floor((this.career().salario_anual_usd.max || 0) / 1000)}k`;
  }

  protected get salaryAvg(): string {
    return `$${Math.floor((this.career().salario_anual_usd.promedio || 0) / 1000)}k`;
  }

  protected get rankLabel(): string | null {
    if (!this.allCareers().length) return null;
    const sorted = [...this.allCareers()].sort(
      (a, b) => (b.demanda_mercado.volumen_total || 0) - (a.demanda_mercado.volumen_total || 0),
    );
    const idx = sorted.findIndex((c) => c.titulo_carrera === this.career().titulo_carrera);
    return idx >= 0 ? `#${idx + 1} de ${sorted.length}` : null;
  }

  protected getRank(): number {
    const sorted = [...this.allCareers()].sort(
      (a, b) => (b.demanda_mercado.volumen_total || 0) - (a.demanda_mercado.volumen_total || 0),
    );
    const idx = sorted.findIndex((c) => c.titulo_carrera === this.career().titulo_carrera);
    return idx >= 0 ? idx + 1 : 0;
  }

  protected getComparedCareers(): Array<{ career: CareerMetrics; rank: number }> {
    if (!this.allCareers().length) return [];
    const sorted = [...this.allCareers()].sort(
      (a, b) => (b.demanda_mercado.volumen_total || 0) - (a.demanda_mercado.volumen_total || 0),
    );
    return sorted.slice(0, 7).map((c, i) => ({ career: c, rank: i + 1 }));
  }

  protected onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  protected getSalaryPosition(): number {
    if (!this.allCareers().length) return 50;
    const avgSalary = this.career().salario_anual_usd.promedio || 0;
    const salaries = this.allCareers().map((c) => c.salario_anual_usd.promedio || 0);
    const max = Math.max(...salaries);
    const min = Math.min(...salaries);
    if (max === min) return 50;
    return Math.round(((avgSalary - min) / (max - min)) * 100);
  }
}
