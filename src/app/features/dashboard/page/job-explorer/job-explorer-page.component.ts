import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketApiService } from '@features/home/services/market-api.service';
import { ProfileContentService } from '@features/profile/services/profile-content.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import { JobOffer } from '@shared/interfaces/market.interface';
import { NavItem } from '@shared/interfaces/dashboard.interface';
import { AuthStorageService } from '@shared/services/auth-storage.service';
import { take } from 'rxjs';

@Component({
  selector: 'itera-job-explorer-page',
  standalone: true,
  imports: [CommonModule, DashboardShellComponent],
  templateUrl: './job-explorer-page.component.html',
  styleUrl: './job-explorer-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobExplorerPageComponent implements OnInit {
  private readonly marketApi = inject(MarketApiService);
  private readonly authStorage = inject(AuthStorageService);
  private readonly profileContentService = inject(ProfileContentService);

  protected readonly currentTheme = this.profileContentService.currentTheme;

  readonly offers = signal<JobOffer[]>([]);
  readonly isLoading = signal(false);
  readonly searchQuery = signal('');

  // Pagination state
  readonly currentPage = signal(0);
  readonly pageSize = 9;

  readonly filteredOffers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.offers();
    return this.offers().filter(
      (o) =>
        o.puesto.toLowerCase().includes(query) ||
        o.empresa.toLowerCase().includes(query) ||
        o.habilidades_requeridas.some((s) => s.toLowerCase().includes(query)),
    );
  });

  protected readonly sidebarItems: ReadonlyArray<NavItem> = [
    { label: 'Panel', href: '/dashboard', icon: 'bi-grid-1x2' },
    { label: 'Explorador de Empleos', href: '/dashboard/jobs', icon: 'bi-search', active: true },
    { label: 'Monitor de Auditoría', href: '/dashboard/audit', icon: 'bi-shield-check' },
    { label: 'Demanda', href: '/dashboard', fragment: 'demand', icon: 'bi-bar-chart-line' },
    { label: 'Mis Rutas', href: '/dashboard', fragment: 'routes', icon: 'bi-signpost-2' },
    { label: 'Habilidades', href: '/dashboard', fragment: 'skills', icon: 'bi-stars' },
    { label: 'Comparación', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Progreso', href: '/dashboard/progress', icon: 'bi-graph-up-arrow' },
  ];

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoading.set(true);
    const skip = this.currentPage() * this.pageSize;

    this.marketApi
      .getOffers(this.pageSize, skip)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.offers.set(data);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        complete: () => this.isLoading.set(false),
      });
  }

  nextPage(): void {
    if (this.offers().length === this.pageSize) {
      this.currentPage.update((p) => p + 1);
      this.loadOffers();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
      this.loadOffers();
    }
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
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
  }
}
