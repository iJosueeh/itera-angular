import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FeatureCard, ProgressCard } from '@shared/interfaces/dashboard.interface';
import { MarketSkill } from '@shared/interfaces/market.interface';

@Component({
  selector: 'itera-feature-highlights',
  standalone: true,
  templateUrl: './feature-highlights.component.html',
  styleUrl: './feature-highlights.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureHighlightsComponent {
  readonly cards = input.required<ReadonlyArray<FeatureCard>>();
  readonly progress = input.required<ProgressCard>();
  readonly readinessScore = input<number>(0);
  readonly marketSkills = input<ReadonlyArray<MarketSkill>>([]);

  protected readonly topCards = computed(() => this.cards().slice(0, 2));
  protected readonly bottomCards = computed(() => this.cards().slice(2));
}
