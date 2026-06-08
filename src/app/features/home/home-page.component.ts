import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MarketApiService } from './services/market-api.service';
import { AuthStorageService } from '@shared/services/auth-storage.service';
import { FeatureHighlightsComponent } from '@shared/components/feature-highlights/feature-highlights.component';
import { HeroSearchComponent } from '@shared/components/hero-search/hero-search.component';
import { MentorBannerComponent } from '@shared/components/mentor-banner/mentor-banner.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { DashboardContentService } from './services/dashboard-content.service';
import { TopNavComponent } from '@shared/components/top-nav/top-nav.component';

@Component({
  selector: 'itera-home-page',
  imports: [
    TopNavComponent,
    HeroSearchComponent,
    FeatureHighlightsComponent,
    MentorBannerComponent,
    FooterComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DashboardContentService],
})
export class HomePageComponent {
  private readonly dashboardContentService = inject(DashboardContentService);
  private readonly marketApi = inject(MarketApiService);
  private readonly authStorage = inject(AuthStorageService);

  protected readonly vm = this.dashboardContentService.vm;
  protected readonly career = this.dashboardContentService.careerSnapshot;

  protected handleSearch(query: string): void {
    if (!query) return;
    this.dashboardContentService.getCareerSnapshot(query);

    // RF-11: Record search telemetry
    const userId = this.authStorage.getUserId() || 'guest';
    this.marketApi.sendTelemetry({
      estudiante_id: userId,
      accion: 'Hero Search',
      datos_contexto: { query },
      tiempo_permanencia_segundos: 0
    }).subscribe();
  }
}
