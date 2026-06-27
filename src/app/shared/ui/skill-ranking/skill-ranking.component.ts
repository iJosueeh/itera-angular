import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface SkillRankingItem {
  label: string;
  value: number;
  percentage: number;
  trend?: string;
}

@Component({
  selector: 'itera-skill-ranking',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="space-y-3">
      @for (skill of data(); track skill.label; let i = $index) {
        <div class="flex items-center gap-3 group">
          <span
            class="text-xs font-bold text-slate-400 w-6 text-right"
            [class.text-primary]="i < 3"
          >
            {{ i + 1 }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-semibold text-slate-700 truncate">
                {{ skill.label }}
              </span>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-primary">
                  {{ skill.percentage | number: '1.1-1' }}%
                </span>
                @if (skill.trend) {
                  <span
                    class="text-xs font-bold"
                    [class.text-emerald-500]="skill.trend === 'creciente'"
                    [class.text-rose-500]="skill.trend === 'decreciente'"
                    [class.text-slate-400]="skill.trend === 'estable'"
                  >
                    @switch (skill.trend) {
                      @case ('creciente') {
                        ↑
                      }
                      @case ('decreciente') {
                        ↓
                      }
                      @default {
                        →
                      }
                    }
                  </span>
                }
              </div>
            </div>
            <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                [style.width.%]="skill.percentage"
                [class.bg-primary]="i < 3"
                [class.bg-slate-400]="i >= 3"
              ></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillRankingComponent {
  data = input.required<SkillRankingItem[]>();
}
