import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketApiService } from '@features/home/services/market-api.service';
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

  readonly offers = signal<JobOffer[]>([]);
  readonly isLoading = signal(false);
  readonly searchQuery = signal('');

  readonly filteredOffers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.offers();
    return this.offers().filter(o => 
      o.puesto.toLowerCase().includes(query) || 
      o.empresa.toLowerCase().includes(query) ||
      o.habilidades_requeridas.some(s => s.toLowerCase().includes(query))
    );
  });

  protected readonly sidebarItems: ReadonlyArray<NavItem> = [
    { label: 'Dashboard', href: '/dashboard', icon: 'bi-grid-1x2' },
    { label: 'Job Explorer', href: '/dashboard/jobs', icon: 'bi-search', active: true },
    { label: 'Audit Monitor', href: '/dashboard/audit', icon: 'bi-shield-check' },
    { label: 'Comparison', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Progress', href: '/dashboard/progress', icon: 'bi-graph-up-arrow' },
  ];

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoading.set(true);
    this.marketApi.getOffers(50).pipe(take(1)).subscribe({
      next: (data) => this.offers.set(data),
      complete: () => this.isLoading.set(false)
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  trackJobView(offer: JobOffer): void {
    const userId = this.authStorage.getUserId() || 'guest';
    this.marketApi.sendTelemetry({
      estudiante_id: userId,
      accion: 'View External Job',
      datos_contexto: { 
        puesto: offer.puesto,
        empresa: offer.empresa,
        url: offer.url_origen
      },
      tiempo_permanencia_segundos: 0
    }).subscribe();
  }
}
