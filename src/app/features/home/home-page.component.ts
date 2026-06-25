import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MarketApiService } from './services/market-api.service';
import { AuthStorageService } from '@shared/services/auth-storage.service';
import { FeatureHighlightsComponent } from '@shared/components/feature-highlights/feature-highlights.component';
import { HeroSearchComponent } from '@shared/components/hero-search/hero-search.component';
import { MentorBannerComponent } from '@shared/components/mentor-banner/mentor-banner.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { DashboardContentService } from './services/dashboard-content.service';
import { TopNavComponent } from '@shared/components/top-nav/top-nav.component';
import { NavItem } from '@shared/interfaces/dashboard.interface';

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
})
export class HomePageComponent {
  private readonly dashboardContentService = inject(DashboardContentService);
  private readonly marketApi = inject(MarketApiService);
  private readonly authStorage = inject(AuthStorageService);
  private readonly router = inject(Router);

  protected readonly vm = this.dashboardContentService.vm;
  protected readonly career = this.dashboardContentService.careerSnapshot;
  protected readonly marketSkills = this.dashboardContentService.marketSkills;
  protected readonly readinessScore = this.dashboardContentService.readinessScore;

  /** Auth-aware nav items: hide auth links for guests, show dashboard for authenticated */
  protected readonly navItems = computed<ReadonlyArray<NavItem>>(() => {
    const authenticated = this.authStorage.isAuthenticated();
    const items: NavItem[] = [{ label: 'Inicio', href: '/', icon: 'bi-house-door', active: true }];

    if (authenticated) {
      items.push({ label: 'Dashboard', href: '/dashboard', icon: 'bi-grid-1x2' });
    } else {
      items.push({ label: 'Entrar', href: '/auth/login', icon: 'bi-box-arrow-in-right' });
      items.push({ label: 'Registrar', href: '/auth/register', icon: 'bi-person-plus' });
    }

    return items;
  });

  protected handleSearch(query: string): void {
    if (!query) return;

    const encoded = encodeURIComponent(query);

    // RF-11: Record search telemetry
    const userId = this.authStorage.getUserId() || 'guest';
    this.marketApi
      .sendTelemetry({
        estudiante_id: userId,
        accion: 'Hero Search',
        datos_contexto: { query },
        tiempo_permanencia_segundos: 0,
      })
      .subscribe();

    if (this.authStorage.isAuthenticated()) {
      // Authenticated: go directly to dashboard with query param
      this.router.navigate(['/dashboard'], { queryParams: { q: query } });
    } else {
      // Guest: redirect to login with returnUrl carrying the query
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: `/dashboard?q=${encoded}` },
      });
    }
  }
}
