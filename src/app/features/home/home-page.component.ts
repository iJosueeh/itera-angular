import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FeatureHighlightsComponent } from '../../shared/components/feature-highlights/feature-highlights.component';
import { HeroSearchComponent } from '../../shared/components/hero-search/hero-search.component';
import { MentorBannerComponent } from '../../shared/components/mentor-banner/mentor-banner.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { DashboardContentService } from './services/dashboard-content.service';
import { TopNavComponent } from '../../shared/components/top-nav/top-nav.component';

@Component({
  selector: 'itera-home-page',
  imports: [TopNavComponent, HeroSearchComponent, FeatureHighlightsComponent, MentorBannerComponent, FooterComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {
  private readonly dashboardContentService = inject(DashboardContentService);
  protected readonly vm = this.dashboardContentService.vm;
}
