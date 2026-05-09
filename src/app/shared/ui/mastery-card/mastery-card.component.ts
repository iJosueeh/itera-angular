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
      this.tone() === 'indigo' ? '#4046b8' : this.tone() === 'emerald' ? '#21b77f' : '#7b83eb';
    return `conic-gradient(${color} ${this.progress()}%, #eef1ff ${this.progress()}%)`;
  }
}
