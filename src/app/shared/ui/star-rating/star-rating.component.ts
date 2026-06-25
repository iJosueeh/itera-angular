import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'itera-star-rating',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-3">
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
            <i
              class="bi"
              [class.bi-star-fill]="star <= (hovered() || value())"
              [class.bi-star]="star > (hovered() || value())"
            ></i>
          </button>
        }
        @if (value() > 0 && !readonly()) {
          <span class="text-xs font-bold text-white/30 ml-2">{{ value() }}/5</span>
        }
      </div>

      @if (withComment() && value() > 0 && !readonly()) {
        <div class="flex flex-col gap-2 animate-in fade-in duration-200">
          <textarea
            [ngModel]="comment()"
            (ngModelChange)="comment.set($event)"
            placeholder="Comentario opcional..."
            rows="2"
            class="textarea textarea-sm bg-white/[0.03] border border-white/[0.08] text-white/80 text-xs font-medium placeholder:text-white/20 resize-none rounded-xl focus:border-primary/40 focus:outline-none"
          ></textarea>
          <button
            type="button"
            (click)="submitWithComment()"
            class="btn btn-xs btn-primary rounded-lg font-black uppercase tracking-widest text-[0.55rem] self-end"
          >
            Enviar
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      button:not(:disabled) {
        cursor: pointer;
      }
      button:not(:disabled):hover {
        transform: scale(1.2);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarRatingComponent {
  value = input<number>(0);
  readonly = input<boolean>(false);
  withComment = input<boolean>(false);
  rated = output<number>();
  feedbackSubmit = output<{ rating: number; comment: string }>();

  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly hovered = signal(0);
  protected readonly comment = signal('');

  protected rate(val: number): void {
    if (this.readonly()) return;
    this.rated.emit(val);
  }

  protected hover(val: number): void {
    if (this.readonly()) return;
    this.hovered.set(val);
  }

  protected submitWithComment(): void {
    this.feedbackSubmit.emit({
      rating: this.value(),
      comment: this.comment(),
    });
    this.comment.set('');
  }
}
