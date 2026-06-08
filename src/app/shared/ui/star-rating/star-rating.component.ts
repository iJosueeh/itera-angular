import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'itera-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-1">
      @for (star of stars; track star) {
        <button 
          type="button" 
          (click)="rate(star)"
          (mouseenter)="hover(star)"
          (mouseleave)="hover(0)"
          class="text-xl transition-all duration-150"
          [class.text-amber-400]="star <= (hovered() || value())"
          [class.text-slate-200]="star > (hovered() || value())"
          [disabled]="readonly()"
        >
          <i class="bi" [class.bi-star-fill]="star <= (hovered() || value())" [class.bi-star]="star > (hovered() || value())"></i>
        </button>
      }
    </div>
  `,
  styles: [`
    button:not(:disabled) { cursor: pointer; }
    button:not(:disabled):hover { transform: scale(1.2); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarRatingComponent {
  value = input<number>(0);
  readonly = input<boolean>(false);
  rated = output<number>();

  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly hovered = signal(0);

  protected rate(val: number): void {
    if (this.readonly()) return;
    this.rated.emit(val);
  }

  protected hover(val: number): void {
    if (this.readonly()) return;
    this.hovered.set(val);
  }
}
