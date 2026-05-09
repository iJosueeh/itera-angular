import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FeatureCard, ProgressCard } from '../../interfaces/dashboard.interface';

@Component({
  selector: 'itera-feature-highlights',
  templateUrl: './feature-highlights.component.html',
  styleUrl: './feature-highlights.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureHighlightsComponent {
  readonly cards = input.required<ReadonlyArray<FeatureCard>>();
  readonly progress = input.required<ProgressCard>();

  protected readonly topCards = computed(() => this.cards().slice(0, 2));
  protected readonly bottomCards = computed(() => this.cards().slice(2));
}
