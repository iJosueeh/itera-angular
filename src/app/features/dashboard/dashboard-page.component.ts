import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DashboardContentService } from './services/dashboard-content.service';
import { FeatureHighlightsComponent } from './components/feature-highlights/feature-highlights.component';
import { HeroSearchComponent } from './components/hero-search/hero-search.component';
import { MentorBannerComponent } from './components/mentor-banner/mentor-banner.component';
import { SiteFooterComponent } from './components/site-footer/site-footer.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { CareerSnapshot } from './interfaces/dashboard.interface';

@Component({
  selector: 'itera-dashboard-page',
  imports: [
    TopNavComponent,
    HeroSearchComponent,
    FeatureHighlightsComponent,
    MentorBannerComponent,
    SiteFooterComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly dashboardContentService = inject(DashboardContentService);
  protected readonly vm = this.dashboardContentService.vm;
  protected readonly isLoading = this.dashboardContentService.isLoading;
  protected readonly loadingError = this.dashboardContentService.error;
  protected readonly lastSearch = signal('');
  protected readonly isAnalyzing = signal(false);
  protected readonly analysisError = signal<string | null>(null);
  protected readonly careerSnapshot = signal<CareerSnapshot | null>(null);

  protected async onExplore(query: string): Promise<void> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return;
    }

    this.lastSearch.set(normalizedQuery);
    this.analysisError.set(null);
    this.isAnalyzing.set(true);

    try {
      const snapshot = await firstValueFrom(
        this.dashboardContentService.getCareerSnapshot(normalizedQuery)
      );
      this.careerSnapshot.set(snapshot);
    } catch {
      this.analysisError.set('No se pudo generar el comparativo de carrera.');
    } finally {
      this.isAnalyzing.set(false);
    }
  }
}
