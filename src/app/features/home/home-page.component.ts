import {
  ChangeDetectionStrategy,
  Component,
  inject,
  computed,
  signal,
  effect,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MarketApiService } from './services/market-api.service';
import { AuthStorageService } from '@shared/services/auth-storage.service';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { DashboardContentService } from './services/dashboard-content.service';
import { TopNavComponent } from '@shared/components/top-nav/top-nav.component';
import { SkillBarChartComponent } from '@shared/ui/skill-bar-chart/skill-bar-chart.component';
import { CareerCardComponent } from '@shared/ui/career-card/career-card.component';
import {
  TrustIndicatorsComponent,
  TrustMetric,
} from '@shared/ui/trust-indicators/trust-indicators.component';
import { CareerDetailModalComponent } from '@shared/ui/career-detail-modal/career-detail-modal.component';
import { NavItem } from '@shared/interfaces/dashboard.interface';
import { CareerMetrics } from '@shared/interfaces/market.interface';

@Component({
  selector: 'itera-home-page',
  imports: [
    TopNavComponent,
    FooterComponent,
    RouterModule,
    SkillBarChartComponent,
    CareerCardComponent,
    TrustIndicatorsComponent,
    CareerDetailModalComponent,
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
  protected readonly topCareers = this.dashboardContentService.topCareers;
  protected readonly totalOffers = this.dashboardContentService.totalOffers;
  protected readonly avgSalary = this.dashboardContentService.avgSalary;
  protected readonly topCompanies = this.dashboardContentService.topCompanies;
  protected readonly careerCategories = this.dashboardContentService.careerCategories;
  protected readonly searchResults = this.dashboardContentService.searchResults;
  protected readonly selectedSearchMatch = this.dashboardContentService.selectedSearchMatch;
  protected readonly isLoadingMarket = signal(true);
  // ponytail: modal state
  protected readonly selectedCareer = signal<CareerMetrics | null>(null);
  protected readonly isAuthenticated = this.authStorage.isAuthenticated;

  constructor() {
    effect(() => {
      if (this.marketSkills().length > 0) {
        this.isLoadingMarket.set(false);
      }
    });
  }

  // Trust indicators data
  protected readonly trustMetrics = computed<TrustMetric[]>(() => [
    {
      icon: 'bi-briefcase',
      value: this.totalOffers(),
      label: 'Ofertas analizadas',
    },
    {
      icon: 'bi-cash-stack',
      value: this.avgSalary(),
      label: 'Salario promedio',
      prefix: '$',
    },
    {
      icon: 'bi-graph-up-arrow',
      value: 89,
      label: 'Match promedio',
      suffix: '%',
    },
  ]);

  // How it works steps
  protected readonly howItWorks = [
    {
      step: '01',
      icon: 'bi-search',
      title: 'Explora',
      description: 'Busca carreras en tech y descubre qué habilidades demanda el mercado.',
      link: '/dashboard/jobs',
    },
    {
      step: '02',
      icon: 'bi-bar-chart-line',
      title: 'Compara',
      description: 'Ve cómo tu perfil se alinea con las ofertas laborales actuales.',
      link: '/dashboard',
    },
    {
      step: '03',
      icon: 'bi-rocket-takeoff',
      title: 'Conecta',
      description: 'Postula con confianza sabiendo que tienes las habilidades correctas.',
      link: '/dashboard/jobs',
    },
  ];

  /** Auth-aware nav items */
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
      this.router.navigate(['/dashboard'], { queryParams: { q: query } });
    } else {
      this.dashboardContentService.searchCareers(query);
    }
  }

  /** Select a different career from search results */
  protected selectMatch(category: string): void {
    this.dashboardContentService.selectSearchMatch(category);
  }

  /** Clear search results */
  protected clearSearch(): void {
    this.dashboardContentService.clearSearch();
  }

  // ponytail: career card click → open modal
  protected openCareerModal(career: CareerMetrics): void {
    this.selectedCareer.set(career);
  }

  protected closeCareerModal(): void {
    this.selectedCareer.set(null);
  }
}
