import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { HeroContent } from '../../interfaces/dashboard.interface';

@Component({
  selector: 'itera-hero-search',
  templateUrl: './hero-search.component.html',
  styleUrl: './hero-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSearchComponent {
  readonly content = input.required<HeroContent>();
  readonly explore = output<string>();
  readonly query = signal('');

  protected onQueryChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
  }

  protected submitSearch(): void {
    this.explore.emit(this.query().trim());
  }

  protected useTrend(label: string): void {
    this.query.set(label);
    this.explore.emit(label);
  }
}
