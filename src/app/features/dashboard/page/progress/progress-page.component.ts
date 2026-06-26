import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  computed,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { DashboardContentService } from '@features/home/services/dashboard-content.service';
import { ProfileContentService } from '@features/profile/services/profile-content.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import { MasteryCardComponent } from '@shared/ui/mastery-card/mastery-card.component';
import { MentorAlertCardComponent } from '@shared/ui/mentor-alert-card/mentor-alert-card.component';
import { BadgeItemComponent } from '@shared/ui/badge-item/badge-item.component';
import { StatBarComponent } from '@shared/ui/stat-bar/stat-bar.component';
import { NavItem } from '@shared/interfaces/dashboard.interface';
import { Skill } from '@shared/interfaces/profile.interface';

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

/** Fallback mastery cards when profile is not loaded */
const FALLBACK_MASTERY_CARDS: ReadonlyArray<MasteryCard> = [
  {
    title: 'Fundamentos de Python',
    subtitle: '4/5 Unidades Completadas',
    progress: 85,
    tone: 'indigo',
  },
  { title: 'Pandas & NumPy', subtitle: '2/8 Unidades Completadas', progress: 35, tone: 'emerald' },
  { title: 'Visualización de Datos', subtitle: 'Módulo Bloqueado', progress: 0, tone: 'violet' },
  { title: 'Deep Learning', subtitle: 'Módulo Bloqueado', progress: 0, tone: 'indigo' },
];

const FALLBACK_BADGES: ReadonlyArray<BadgeItem> = [
  { label: 'Iniciado', icon: 'bi-award', earned: true },
  { label: 'Explorador', icon: 'bi-compass', earned: true },
  { label: 'Analista', icon: 'bi-stars', earned: true },
  { label: 'Constructor', icon: 'bi-box-seam', earned: false },
  { label: 'Mentor', icon: 'bi-lightbulb', earned: false },
  { label: 'Arquitecto', icon: 'bi-diagram-3', earned: false },
  { label: 'Lanzamiento', icon: 'bi-rocket', earned: false },
  { label: 'Maestro', icon: 'bi-trophy', earned: false },
];

const FALLBACK_MILESTONES: ReadonlyArray<MilestoneItem> = [
  { title: 'Maestría en Decoradores', meta: 'Estimado: 45 min', status: 'completed' },
  {
    title: 'Manejo de Errores Pro',
    meta: 'Bloqueado hasta completar el anterior',
    status: 'in-progress',
  },
  { title: 'Proyecto Final de Módulo', meta: 'Bloqueado', status: 'locked' },
];

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
  private readonly router = inject(Router);

  protected readonly vm = this.dashboardContentService.vm;
  protected readonly currentTheme = this.profileContentService.currentTheme;
  protected readonly profile = this.profileContentService.profile;
  protected readonly isLoading = this.profileContentService.isLoading;
  protected readonly error = this.profileContentService.error;

  /** Derive mastery cards from profile skills, or use fallback */
  protected readonly masteryCards = computed<ReadonlyArray<MasteryCard>>(() => {
    const p = this.profile();
    if (!p?.skills?.length) return FALLBACK_MASTERY_CARDS;

    const tones: Array<'indigo' | 'emerald' | 'violet'> = ['indigo', 'emerald', 'violet'];
    return p.skills.map((skill: Skill, i: number) => {
      const levelPercent = this.skillLevelToPercent(skill.level);
      const subtitle =
        levelPercent >= 100
          ? 'Dominio completo'
          : levelPercent > 0
            ? `Nivel: ${skill.level}`
            : 'Sin comenzar';

      return {
        title: skill.name,
        subtitle,
        progress: levelPercent,
        tone: tones[i % tones.length],
      };
    });
  });

  /** Derive badges from profile, or use fallback */
  protected readonly badges = computed<ReadonlyArray<BadgeItem>>(() => {
    const p = this.profile();
    if (!p?.badges || !Array.isArray(p.badges) || p.badges.length === 0) {
      return FALLBACK_BADGES;
    }

    const iconMap: Record<string, string> = {
      Iniciado: 'bi-award',
      Explorador: 'bi-compass',
      Analista: 'bi-stars',
      Constructor: 'bi-box-seam',
      Mentor: 'bi-lightbulb',
      Arquitecto: 'bi-diagram-3',
      Lanzamiento: 'bi-rocket',
      Maestro: 'bi-trophy',
    };

    return p.badges.map((b: any) => ({
      label: b.name || b.label || 'Badge',
      icon: iconMap[b.name || b.label] || 'bi-patch-check',
      earned: b.earned ?? true,
    }));
  });

  /** Derive milestones from roadmap, or use fallback */
  protected readonly milestones = computed<ReadonlyArray<MilestoneItem>>(() => {
    const p = this.profile();
    const roadmap = p?.roadmap;
    if (!roadmap || !Array.isArray(roadmap) || roadmap.length === 0) {
      return FALLBACK_MILESTONES;
    }

    return roadmap.slice(0, 5).map((node: any, i: number) => {
      const status: MilestoneItem['status'] =
        node.status === 'completed' ? 'completed' : i === 0 ? 'in-progress' : 'locked';
      const meta =
        status === 'completed'
          ? 'Completado'
          : status === 'in-progress'
            ? 'En progreso'
            : 'Bloqueado';

      return { title: node.name || node.label || `Paso ${i + 1}`, meta, status };
    });
  });

  /** Earned badge count */
  protected readonly earnedBadgeCount = computed(
    () => this.badges().filter((b) => b.earned).length,
  );

  ngOnInit(): void {
    this.profileContentService.loadProfile();

    // Auth check: if profile fails with 401, redirect to login
    // The ProfileContentService sets error on failure; we check for auth errors
    // by watching the error signal. Since the service catches all errors,
    // we add a check via the router on the next tick.
    setTimeout(() => {
      if (this.error() && !this.profile() && !this.isLoading()) {
        // Could be an auth error — try to detect 401 by checking if session is invalid
        // The auth interceptor sends withCredentials, so a 401 means the cookie is invalid
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: '/dashboard/progress' },
        });
      }
    });
  }

  private skillLevelToPercent(level: string): number {
    switch (level?.toLowerCase()) {
      case 'advanced':
      case 'avanzado':
        return 90;
      case 'intermediate':
      case 'intermedio':
        return 55;
      case 'beginner':
      case 'principiante':
        return 25;
      default:
        return 0;
    }
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
    { label: 'Mi Perfil', href: '/dashboard/profile', icon: 'bi-person' },
  ];
}
