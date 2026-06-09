import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DashboardContentService } from '@features/home/services/dashboard-content.service';
import { ProfileContentService } from '@features/profile/services/profile-content.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import { MasteryCardComponent } from '@shared/ui/mastery-card/mastery-card.component';
import { MentorAlertCardComponent } from '@shared/ui/mentor-alert-card/mentor-alert-card.component';
import { BadgeItemComponent } from '@shared/ui/badge-item/badge-item.component';
import { StatBarComponent } from '@shared/ui/stat-bar/stat-bar.component';
import { NavItem } from '@shared/interfaces/dashboard.interface';

interface MasteryCard {
  title: string;
  subtitle: string;
  progress: number;
  tone: 'indigo' | 'emerald' | 'violet';
}

interface MilestoneItem {
  title: string;
  meta: string;
  status: 'completed' | 'in-progress' | 'locked';
}

interface BadgeItem {
  label: string;
  icon: string;
  earned: boolean;
}

@Component({
  selector: 'itera-dashboard-progress-page',
  standalone: true,
  imports: [
    DashboardShellComponent,
    MasteryCardComponent,
    MentorAlertCardComponent,
    BadgeItemComponent,
    StatBarComponent,
  ],
  templateUrl: './progress-page.component.html',
  styleUrl: './progress-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressPageComponent implements OnInit {
  private readonly dashboardContentService = inject(DashboardContentService);
  private readonly profileContentService = inject(ProfileContentService);

  protected readonly vm = this.dashboardContentService.vm;
  protected readonly currentTheme = this.profileContentService.currentTheme;

  protected readonly profile = this.profileContentService.profile;

  ngOnInit(): void {
    this.profileContentService.loadProfile();
  }

  protected readonly topNavItems: ReadonlyArray<NavItem> = [
    { label: 'Panel', href: '/dashboard', icon: 'bi-grid-1x2' },
    { label: 'Comparación', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Progreso', href: '/dashboard/progress', icon: 'bi-graph-up-arrow', active: true },
  ];

  protected readonly sidebarItems: ReadonlyArray<NavItem> = [
    { label: 'Panel', href: '/dashboard', icon: 'bi-grid-1x2' },
    { label: 'Explorador de Empleos', href: '/dashboard/jobs', icon: 'bi-search' },
    { label: 'Monitor de Auditoría', href: '/dashboard/audit', icon: 'bi-shield-check' },
    { label: 'Demanda', href: '/dashboard', fragment: 'demand', icon: 'bi-bar-chart-line' },
    { label: 'Mis Rutas', href: '/dashboard', fragment: 'routes', icon: 'bi-signpost-2' },
    { label: 'Habilidades', href: '/dashboard', fragment: 'skills', icon: 'bi-stars' },
    { label: 'Comparación', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
    { label: 'Progreso', href: '/dashboard/progress', icon: 'bi-graph-up-arrow', active: true },
  ];

  protected readonly masteryCards: ReadonlyArray<MasteryCard> = [
    { title: 'Fundamentos de Python', subtitle: '4/5 Unidades Completadas', progress: 85, tone: 'indigo' },
    { title: 'Pandas & NumPy', subtitle: '2/8 Unidades Completadas', progress: 35, tone: 'emerald' },
    { title: 'Visualización de Datos', subtitle: 'Módulo Bloqueado', progress: 0, tone: 'violet' },
    { title: 'Deep Learning', subtitle: 'Módulo Bloqueado', progress: 0, tone: 'indigo' },
  ];

  protected readonly badges: ReadonlyArray<BadgeItem> = [
    { label: 'Iniciado', icon: 'bi-award', earned: true },
    { label: 'Explorador', icon: 'bi-compass', earned: true },
    { label: 'Analista', icon: 'bi-stars', earned: true },
    { label: 'Constructor', icon: 'bi-box-seam', earned: false },
    { label: 'Mentor', icon: 'bi-lightbulb', earned: false },
    { label: 'Arquitecto', icon: 'bi-diagram-3', earned: false },
    { label: 'Lanzamiento', icon: 'bi-rocket', earned: false },
    { label: 'Maestro', icon: 'bi-trophy', earned: false },
  ];

  protected readonly milestones: ReadonlyArray<MilestoneItem> = [
    { title: 'Maestría en Decoradores', meta: 'Estimado: 45 min', status: 'completed' },
    { title: 'Manejo de Errores Pro', meta: 'Bloqueado hasta completar el anterior', status: 'in-progress' },
    { title: 'Proyecto Final de Módulo', meta: 'Bloqueado', status: 'locked' },
  ];
}
