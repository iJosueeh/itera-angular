import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MasteryCardTone = 'indigo' | 'emerald' | 'violet';

@Component({
  selector: 'itera-mastery-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mastery-card.component.html',
  styleUrl: './mastery-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasteryCardComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
  progress = input.required<number>();
  tone = input<MasteryCardTone>('indigo');

  protected get gradient(): string {
    const color =
      this.tone() === 'indigo' ? '#6366f1' : this.tone() === 'emerald' ? '#10b981' : '#8b5cf6';
    return `conic-gradient(${color} ${this.progress()}%, #e2e8f0 ${this.progress()}%)`;
  }
}
