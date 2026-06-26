import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MarketSkill } from '@shared/interfaces/market.interface';

export interface SkillBarData {
  label: string;
  value: number;
  maxValue: number;
}

@Component({
  selector: 'itera-skill-bar-chart',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './skill-bar-chart.component.html',
  styleUrl: './skill-bar-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillBarChartComponent {
  readonly skills = input.required<ReadonlyArray<MarketSkill>>();
  readonly maxItems = input<number>(8);
  readonly showValues = input<boolean>(true);
  readonly animated = input<boolean>(true);

  protected readonly chartData = computed<SkillBarData[]>(() => {
    const items = this.skills().slice(0, this.maxItems());
    const maxValue = Math.max(...items.map(s => s.demanda_actual), 1);

    return items.map(skill => ({
      label: skill.habilidad,
      value: skill.demanda_actual,
      maxValue,
    }));
  });

  protected getBarWidth(item: SkillBarData): string {
    return `${(item.value / item.maxValue) * 100}%`;
  }

  protected getBarColor(index: number): string {
    const colors = [
      'bg-primary',
      'bg-secondary',
      'bg-accent',
      'bg-primary/80',
      'bg-secondary/80',
      'bg-accent/80',
    ];
    return colors[index % colors.length];
  }
}
