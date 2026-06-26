import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketApiService } from '@features/home/services/market-api.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import { NavItem } from '@shared/interfaces/dashboard.interface';
import { take, Subscription, interval } from 'rxjs';

@Component({
  selector: 'itera-audit-monitor-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardShellComponent],
  templateUrl: './audit-monitor-page.component.html',
  styleUrl: './audit-monitor-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditMonitorPageComponent implements OnInit, OnDestroy {
  private readonly marketApi = inject(MarketApiService);
  private refreshSub: Subscription | null = null;

  readonly auditLogs = signal<any[]>([]);
  readonly isLoading = signal(false);
  readonly autoRefresh = signal(false);
  readonly selectedSource = signal<string>('');
  readonly dateFrom = signal<string>('');
  readonly dateTo = signal<string>('');
  readonly expandedRowId = signal<string | null>(null);

  readonly sources = ['LinkedIn', 'Computrabajo'];

  readonly filteredLogs = computed(() => {
    let logs = this.auditLogs();
    const source = this.selectedSource();
    const from = this.dateFrom();
    const to = this.dateTo();

    if (source) {
      logs = logs.filter((l: any) => l.fuente === source);
    }

    if (from) {
      const fromDate = new Date(from);
      logs = logs.filter((l: any) => new Date(l.fecha_ejecucion) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      logs = logs.filter((l: any) => new Date(l.fecha_ejecucion) <= toDate);
    }

    return logs;
  });

  protected readonly sidebarItems: ReadonlyArray<NavItem> = [
    { label: 'Panel', href: '/dashboard', icon: 'bi-grid-1x2' },
    { label: 'Explorador de Empleos', href: '/dashboard/jobs', icon: 'bi-search' },
    {
      label: 'Monitor de Auditoría',
      href: '/dashboard/audit',
      icon: 'bi-shield-check',
      active: true,
    },
    { label: 'Comparación', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Progreso', href: '/dashboard/progress', icon: 'bi-graph-up-arrow' },
    { label: 'Mi Perfil', href: '/dashboard/profile', icon: 'bi-person' },
  ];

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  loadAuditLogs(): void {
    this.isLoading.set(true);
    this.marketApi
      .getScrapingAudit(50)
      .pipe(take(1))
      .subscribe({
        next: (data) => this.auditLogs.set(data),
        complete: () => this.isLoading.set(false),
      });
  }

  toggleAutoRefresh(): void {
    if (this.autoRefresh()) {
      this.stopAutoRefresh();
    } else {
      this.startAutoRefresh();
    }
  }

  private startAutoRefresh(): void {
    this.autoRefresh.set(true);
    this.refreshSub = interval(30000).subscribe(() => {
      this.marketApi
        .getScrapingAudit(50)
        .pipe(take(1))
        .subscribe({
          next: (data) => this.auditLogs.set(data),
        });
    });
  }

  private stopAutoRefresh(): void {
    this.autoRefresh.set(false);
    this.refreshSub?.unsubscribe();
    this.refreshSub = null;
  }

  setSourceFilter(source: string): void {
    this.selectedSource.set(this.selectedSource() === source ? '' : source);
  }

  toggleRowExpand(id: string): void {
    this.expandedRowId.set(this.expandedRowId() === id ? null : id);
  }

  clearFilters(): void {
    this.selectedSource.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completado':
        return 'bg-secondary/20 text-secondary border-none';
      case 'iniciado':
        return 'bg-blue-500/20 text-blue-400 border-none';
      case 'error':
        return 'bg-rose-500/20 text-red-400 border-none';
      default:
        return 'bg-white/5 text-white/40 border-none';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completado':
        return 'bi-check-circle-fill';
      case 'iniciado':
        return 'bi-hourglass-split';
      case 'error':
        return 'bi-exclamation-triangle-fill';
      default:
        return 'bi-dash-circle';
    }
  }
}
