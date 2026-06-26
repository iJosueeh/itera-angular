import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'itera-skeleton',
  standalone: true,
  template: `
    <div
      class="animate-pulse rounded-[1.5rem]"
      [class]="containerClass()"
      [style.width]="width()"
      [style.height]="height()"
    >
      @if (lines() > 0) {
        <div class="space-y-3 p-6">
          @for (i of lineArray(); track i) {
            <div
              class="h-3 rounded-full bg-white/[0.05]"
              [style.width]="lineWidth(i)"
            ></div>
          }
        </div>
      } @else {
        <div class="w-full h-full bg-white/[0.03] rounded-[1.5rem]"></div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  width = input<string>('100%');
  height = input<string>('200px');
  lines = input<number>(0);
  containerClass = input<string>('bg-neutral/40 border border-white/[0.03]');

  protected lineArray(): number[] {
    return Array.from({ length: this.lines() }, (_, i) => i);
  }

  protected lineWidth(index: number): string {
    const widths = ['100%', '90%', '75%', '85%', '60%'];
    return widths[index % widths.length];
  }
}
