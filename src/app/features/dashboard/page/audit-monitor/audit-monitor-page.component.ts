import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketApiService } from '@features/home/services/market-api.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import { NavItem } from '@shared/interfaces/dashboard.interface';
import { take } from 'rxjs';

@Component({
  selector: 'itera-audit-monitor-page',
  standalone: true,
  imports: [CommonModule, DashboardShellComponent],
  templateUrl: './audit-monitor-page.component.html',
  styleUrl: './audit-monitor-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditMonitorPageComponent implements OnInit {
  private readonly marketApi = inject(MarketApiService);

  readonly auditLogs = signal<any[]>([]);
  readonly isLoading = signal(false);

  protected readonly sidebarItems: ReadonlyArray<NavItem> = [
    { label: 'Dashboard', href: '/dashboard', icon: 'bi-grid-1x2' },
    { label: 'Job Explorer', href: '/dashboard/jobs', icon: 'bi-search' },
    { label: 'Audit Monitor', href: '/dashboard/audit', icon: 'bi-shield-check', active: true },
    { label: 'Comparison', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Progress', href: '/dashboard/progress', icon: 'bi-graph-up-arrow' },
  ];

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.isLoading.set(true);
    this.marketApi.getScrapingAudit(50).pipe(take(1)).subscribe({
      next: (data) => this.auditLogs.set(data),
      complete: () => this.isLoading.set(false)
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completado': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'iniciado': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'error': return 'bg-rose-50 text-red-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  }
}
