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
import { LearningApiService, LearningProgress } from '@features/home/services/learning-api.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import { MasteryCardComponent } from '@shared/ui/mastery-card/mastery-card.component';
import { MentorAlertCardComponent } from '@shared/ui/mentor-alert-card/mentor-alert-card.component';
import { BadgeItemComponent } from '@shared/ui/badge-item/badge-item.component';
import { StatBarComponent } from '@shared/ui/stat-bar/stat-bar.component';
import {
  NavItem,
  DASHBOARD_SIDEBAR_ITEMS,
  DASHBOARD_TOP_NAV_ITEMS,
} from '@shared/interfaces/dashboard.interface';
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
  private readonly learningApi = inject(LearningApiService);
  private readonly router = inject(Router);

  protected readonly vm = this.dashboardContentService.vm;
  protected readonly currentTheme = this.profileContentService.currentTheme;
  protected readonly profile = this.profileContentService.profile;
  protected readonly isLoading = this.profileContentService.isLoading;
  protected readonly error = this.profileContentService.error;

  // Learning progress from API
  protected readonly learningProgress = signal<LearningProgress | null>(null);

  // Current learning path for milestone names
  protected readonly currentPath = signal<{
    goal_id: string;
    nodes: Array<{ id: string; name: string; status: string; order: number }>;
  } | null>(null);

  /** Dynamic stat bars calculated from real data */
  protected readonly statBars = computed(() => {
    const p = this.profile();
    const progress = this.learningProgress();

    if (!p) return [];

    // 1. Route Progress: from learning API
    const routeProgress = progress?.progress_percent ?? 0;

    // 2. Skills Mastery: % of skills at advanced level
    const skills = p.skills || [];
    const advancedCount = skills.filter(
      (s) => s.level === 'advanced' || s.level === 'avanzado',
    ).length;
    const skillsMastery = skills.length > 0 ? Math.round((advancedCount / skills.length) * 100) : 0;

    // 3. Market Alignment: from matchScore
    const marketAlignment = p.matchScore?.score ?? 0;

    return [
      { label: 'Progreso de Ruta', value: routeProgress, color: '#6366f1' },
      { label: 'Skills Dominadas', value: skillsMastery, color: '#10b981' },
      { label: 'Alineación con el Mercado', value: marketAlignment, color: '#8b5cf6' },
    ];
  });

  /** Smart mastery cards with market context */
  protected readonly masteryCards = computed<ReadonlyArray<MasteryCard>>(() => {
    const p = this.profile();
    if (!p?.skills?.length) return [];

    const tones: Array<'indigo' | 'emerald' | 'violet'> = ['indigo', 'emerald', 'violet'];
    const missingSkills = p.matchScore?.habilidades_faltantes || [];

    // Sort: in-progress first, then by level
    const sortedSkills = [...p.skills].sort((a, b) => {
      const aPercent = this.skillLevelToPercent(a.level);
      const bPercent = this.skillLevelToPercent(b.level);
      // Prioritize intermediate skills (in-progress)
      if (aPercent === 55 && bPercent !== 55) return -1;
      if (bPercent === 55 && aPercent !== 55) return 1;
      return bPercent - aPercent;
    });

    return sortedSkills.map((skill: Skill, i: number) => {
      const levelPercent = this.skillLevelToPercent(skill.level);
      const isMissing = missingSkills.includes(skill.name);

      let subtitle: string;
      if (levelPercent >= 90) {
        subtitle = 'Dominio completo';
      } else if (levelPercent > 0) {
        subtitle = isMissing ? `Nivel: ${skill.level} (alta demanda)` : `Nivel: ${skill.level}`;
      } else {
        subtitle = 'Sin comenzar';
      }

      return {
        title: skill.name,
        subtitle,
        progress: levelPercent,
        tone: tones[i % tones.length],
      };
    });
  });

  /** Contextual mentor alert based on user state */
  protected readonly mentorAlert = computed(() => {
    const p = this.profile();
    const progress = this.learningProgress();

    if (!p) {
      return {
        title: 'Completa tu perfil',
        message: 'Agrega tus habilidades en Mi Perfil para comenzar tu ruta de aprendizaje.',
      };
    }

    const matchScore = p.matchScore?.score ?? 0;
    const missingSkills = p.matchScore?.habilidades_faltantes || [];
    const skills = p.skills || [];

    // Case 1: Low match score with missing skills
    if (matchScore < 60 && missingSkills.length > 0) {
      return {
        title: 'Enfócate en lo crítico',
        message: `Tu alineación con el mercado es del ${matchScore}%. Prioriza aprender: ${missingSkills.slice(0, 2).join(', ')}.`,
      };
    }

    // Case 2: Low route progress
    if (progress && progress.progress_percent < 30) {
      return {
        title: 'Retoma tu ruta',
        message: `Llevas ${progress.progress_percent}% de tu ruta. Cada día cuenta para alcanzar tu meta.`,
      };
    }

    // Case 3: Few skills
    if (skills.length < 3) {
      return {
        title: 'Expande tu arsenal',
        message:
          'Tienes pocas habilidades registradas. Explora el mercado y agrega más skills a tu perfil.',
      };
    }

    // Case 4: Good progress, encourage consistency
    return {
      title: 'Mantén el ritmo',
      message: 'Vas por buen camino. Sigue practicando y completa los siguientes hitos de tu ruta.',
    };
  });

  /** Badges with earning logic */
  protected readonly badges = computed<ReadonlyArray<BadgeItem>>(() => {
    const p = this.profile();
    if (!p) return [];

    const skills = p.skills || [];
    const advancedCount = skills.filter(
      (s) => s.level === 'advanced' || s.level === 'avanzado',
    ).length;
    const intermediatePlus = skills.filter(
      (s) =>
        s.level === 'intermediate' ||
        s.level === 'intermedio' ||
        s.level === 'advanced' ||
        s.level === 'avanzado',
    ).length;

    return [
      {
        label: 'Iniciado',
        icon: 'bi-award',
        earned: true, // Has profile
      },
      {
        label: 'Explorador',
        icon: 'bi-compass',
        earned: skills.length >= 3,
      },
      {
        label: 'Analista',
        icon: 'bi-stars',
        earned: !!p.matchScore,
      },
      {
        label: 'Constructor',
        icon: 'bi-box-seam',
        earned: intermediatePlus >= 5,
      },
      {
        label: 'Mentor',
        icon: 'bi-lightbulb',
        earned: advancedCount >= 2,
      },
      {
        label: 'Arquitecto',
        icon: 'bi-diagram-3',
        earned: skills.length >= 8,
      },
      {
        label: 'Lanzamiento',
        icon: 'bi-rocket',
        earned: (p.matchScore?.score ?? 0) >= 80,
      },
      {
        label: 'Maestro',
        icon: 'bi-trophy',
        earned: advancedCount >= 5,
      },
    ];
  });

  /** Milestones from learning path — only shows real node names, empty if no path loaded */
  protected readonly milestones = computed<ReadonlyArray<MilestoneItem>>(() => {
    const p = this.profile();
    const progress = this.learningProgress();
    const path = this.currentPath();

    if (!p) return [];

    // No progress started — return empty (empty state shown in template)
    if (!progress || (progress.completed_nodes?.length === 0 && !progress.current_node)) {
      return [];
    }

    // Don't show milestones if path isn't loaded yet (avoids generic "Hito X" names)
    if (!path?.nodes?.length) return [];

    const completedNodes = progress.completed_nodes || [];
    const completedCount = completedNodes.length;
    const totalNodes = progress.total_nodes ?? 0;

    if (totalNodes === 0) return [];

    const milestones: MilestoneItem[] = [];
    const nodes = path.nodes;

    // Show next 3-5 milestones
    const startIdx = completedCount;
    const endIdx = Math.min(completedCount + 5, totalNodes);

    for (let i = startIdx; i < endIdx; i++) {
      const node = nodes[i];
      if (!node) continue;

      const isCurrent = progress.current_node && i === completedCount;

      milestones.push({
        title: isCurrent ? node.name : node.name,
        meta: isCurrent ? 'En progreso' : 'Pendiente',
        status: isCurrent ? 'in-progress' : 'locked',
      });
    }

    return milestones;
  });

  /** Earned badge count */
  protected readonly earnedBadgeCount = computed(
    () => this.badges().filter((b) => b.earned).length,
  );

  ngOnInit(): void {
    this.profileContentService.loadProfile();
    this.loadLearningProgress();

    // Auth check
    setTimeout(() => {
      if (this.error() && !this.profile() && !this.isLoading()) {
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: '/dashboard/progress' },
        });
      }
    });
  }

  private loadLearningProgress(): void {
    const userId = this.profileContentService.profile()?.userId;
    if (!userId) {
      // Retry after profile loads
      setTimeout(() => this.loadLearningProgress(), 1000);
      return;
    }

    this.learningApi.getProgress(userId).subscribe({
      next: (response) => {
        if (response.progress && response.progress.length > 0) {
          this.learningProgress.set(response.progress[0]);
          // Load the path to get node names for milestones
          const goalId = response.progress[0].goal_id;
          this.learningApi.getPath(goalId).subscribe({
            next: (path) => {
              this.currentPath.set(path);
            },
            error: (err) => {
              console.error('Failed to load learning path:', err);
            },
          });
        }
      },
      error: (err) => {
        console.error('Failed to load learning progress:', err);
      },
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

  protected readonly topNavItems = DASHBOARD_TOP_NAV_ITEMS;

  protected readonly sidebarItems = DASHBOARD_SIDEBAR_ITEMS.map((item) => ({
    ...item,
    active: item.href === '/dashboard/progress',
  }));
}
