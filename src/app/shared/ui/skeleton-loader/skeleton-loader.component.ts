import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'card' | 'bar';

@Component({
  selector: 'itera-skeleton',
  standalone: true,
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
  readonly variant = input<SkeletonVariant>('text');
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');
  readonly rounded = input<string>('0.5rem');
  readonly count = input<number>(1);

  protected readonly skeletonItems = computed(() => {
    return Array.from({ length: this.count() }, (_, i) => i);
  });
}
