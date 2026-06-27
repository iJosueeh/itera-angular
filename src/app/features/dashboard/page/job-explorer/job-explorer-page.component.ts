import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MarketApiService, OfferFilters } from '@features/home/services/market-api.service';
import { ProfileContentService } from '@features/profile/services/profile-content.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import { JobOffer } from '@shared/interfaces/market.interface';
import { NavItem } from '@shared/interfaces/dashboard.interface';
import { AuthStorageService } from '@shared/services/auth-storage.service';
import { PageTelemetryService } from '@shared/services/page-telemetry.service';
import { take } from 'rxjs';

@Component({
  selector: 'itera-job-explorer-page',
  standalone: true,
  imports: [CommonModule, DashboardShellComponent, RouterModule],
  templateUrl: './job-explorer-page.component.html',
  styleUrl: './job-explorer-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobExplorerPageComponent implements OnInit, OnDestroy {
  private readonly marketApi = inject(MarketApiService);
  private readonly authStorage = inject(AuthStorageService);
  private readonly profileContentService = inject(ProfileContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly telemetry = inject(PageTelemetryService);

  protected readonly currentTheme = this.profileContentService.currentTheme;

  readonly offers = signal<JobOffer[]>([]);
  readonly isLoading = signal(false);
  readonly searchQuery = signal('');
  readonly activeSkillFilter = signal<string | null>(null);
  readonly activeModalityFilter = signal<string | null>(null);

  // Scraper state
  readonly isScraperRunning = signal(false);
  readonly scraperMessage = signal<string | null>(null);

  // Auth state
  readonly isAuthenticated = computed(() => this.authStorage.isAuthenticated());

  // Pagination state
  readonly currentPage = signal(0);
  readonly pageSize = 9;

  /** Popular skill chips for quick filtering */
  readonly popularSkills = [
    'Python',
    'React',
    'TypeScript',
    'AWS',
    'Docker',
    'Node.js',
    'Java',
    'SQL',
  ];

  /** Available modality options */
  readonly modalities = [
    { value: 'remoto', label: 'Remoto', icon: 'bi-globe' },
    { value: 'presencial', label: 'Presencial', icon: 'bi-building' },
    { value: 'híbrido', label: 'Híbrido', icon: 'bi-laptop' },
  ];

  /** Build filter object from current state */
  private buildFilters(): OfferFilters {
    const filters: OfferFilters = {};
    const q = this.searchQuery();
    if (q) filters.q = q;
    const skill = this.activeSkillFilter();
    if (skill) filters.skill = skill;
    const modality = this.activeModalityFilter();
    if (modality) filters.modality = modality;
    return filters;
  }

  protected readonly sidebarItems: ReadonlyArray<NavItem> = [
    { label: 'Panel', href: '/dashboard', icon: 'bi-grid-1x2' },
    { label: 'Explorador de Empleos', href: '/dashboard/jobs', icon: 'bi-search', active: true },
    { label: 'Demanda', href: '/dashboard', fragment: 'demand', icon: 'bi-bar-chart-line' },
    { label: 'Mis Rutas', href: '/dashboard', fragment: 'routes', icon: 'bi-signpost-2' },
    { label: 'Habilidades', href: '/dashboard', fragment: 'skills', icon: 'bi-stars' },
    { label: 'Comparación', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Progreso', href: '/dashboard/progress', icon: 'bi-graph-up-arrow' },
    { label: 'Mi Perfil', href: '/dashboard/profile', icon: 'bi-person' },
  ];

  ngOnInit(): void {
    this.telemetry.startTracking('job-explorer');

    // Read query params from URL on init
    const q = this.route.snapshot.queryParamMap.get('q');
    const page = this.route.snapshot.queryParamMap.get('page');
    const skill = this.route.snapshot.queryParamMap.get('skill');
    const modality = this.route.snapshot.queryParamMap.get('modality');

    if (q) this.searchQuery.set(q);
    if (skill) this.activeSkillFilter.set(skill);
    if (modality) this.activeModalityFilter.set(modality);
    if (page) {
      const parsed = Math.max(0, parseInt(page, 10) || 0);
      this.currentPage.set(parsed);
    }

    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoading.set(true);
    const skip = this.currentPage() * this.pageSize;
    const filters = this.buildFilters();

    this.marketApi
      .getOffers(this.pageSize, skip, filters)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.offers.set(data);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        complete: () => this.isLoading.set(false),
      });
  }

  /** Sync all filter state to URL */
  private syncQueryToUrl(): void {
    const queryParams: Record<string, string | null> = {
      q: this.searchQuery() || null,
      skill: this.activeSkillFilter() || null,
      modality: this.activeModalityFilter() || null,
      page: this.currentPage() > 0 ? String(this.currentPage() + 1) : null,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.currentPage.set(0);
    this.syncQueryToUrl();
    this.loadOffers();
  }

  toggleSkillFilter(skill: string): void {
    const current = this.activeSkillFilter();
    this.activeSkillFilter.set(current === skill ? null : skill);
    this.currentPage.set(0);
    this.syncQueryToUrl();
    this.loadOffers();
  }

  toggleModalityFilter(modality: string): void {
    const current = this.activeModalityFilter();
    this.activeModalityFilter.set(current === modality ? null : modality);
    this.currentPage.set(0);
    this.syncQueryToUrl();
    this.loadOffers();
  }

  clearAllFilters(): void {
    this.searchQuery.set('');
    this.activeSkillFilter.set(null);
    this.activeModalityFilter.set(null);
    this.currentPage.set(0);
    this.syncQueryToUrl();
    this.loadOffers();
  }

  nextPage(): void {
    if (this.offers().length === this.pageSize) {
      this.currentPage.update((p) => p + 1);
      this.syncQueryToUrl();
      this.loadOffers();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
      this.syncQueryToUrl();
      this.loadOffers();
    }
  }

  triggerScraper(): void {
    const query = this.searchQuery() || 'software developer';
    this.isScraperRunning.set(true);
    this.scraperMessage.set(null);

    this.marketApi
      .runScraper(query)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.scraperMessage.set(res.message);
          this.isScraperRunning.set(false);
        },
        error: () => {
          this.scraperMessage.set('Error al iniciar el scraping. Intenta nuevamente.');
          this.isScraperRunning.set(false);
        },
      });
  }

  trackJobView(offer: JobOffer): void {
    const userId = this.authStorage.getUserId() || 'guest';
    this.marketApi
      .sendTelemetry({
        estudiante_id: userId,
        accion: 'View External Job',
        datos_contexto: {
          puesto: offer.puesto,
          empresa: offer.empresa,
          url: offer.url_origen,
        },
        tiempo_permanencia_segundos: 0,
      })
      .subscribe();

    // Open through our redirect proxy to avoid 403 from external sites
    const proxyUrl = `/api/ia/offers/redirect?url=${encodeURIComponent(offer.url_origen)}`;
    window.open(proxyUrl, '_blank', 'noopener,noreferrer');
  }

  onCompareProfile(): void {
    if (this.authStorage.isAuthenticated()) {
      // Authenticated: go directly to dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // Guest: redirect to login, then back to dashboard
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/dashboard' },
      });
    }
  }

  ngOnDestroy(): void {
    this.telemetry.stopTracking();
  }
}
