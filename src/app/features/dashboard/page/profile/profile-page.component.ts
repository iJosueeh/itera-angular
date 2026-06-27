import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  computed,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfileContentService } from '@features/profile/services/profile-content.service';
import { ProfileApiService } from '@features/profile/services/profile-api.service';
import { DashboardContentService } from '@features/home/services/dashboard-content.service';
import { SkillsApiService } from '@features/home/services/skills-api.service';
import { DashboardShellComponent } from '@shared/components/dashboard-shell/dashboard-shell.component';
import {
  NavItem,
  DASHBOARD_SIDEBAR_ITEMS,
  DASHBOARD_TOP_NAV_ITEMS,
} from '@shared/interfaces/dashboard.interface';
import { Skill } from '@shared/interfaces/profile.interface';
import { AuthStorageService } from '@shared/services/auth-storage.service';

const BADGE_ICON_MAP: Record<string, string> = {
  Iniciado: 'bi-award',
  Explorador: 'bi-compass',
  Analista: 'bi-stars',
  Constructor: 'bi-box-seam',
  Mentor: 'bi-lightbulb',
  Arquitecto: 'bi-diagram-3',
  Lanzamiento: 'bi-rocket',
  Maestro: 'bi-trophy',
};

const ACADEMIC_GOALS_LIST: ReadonlyArray<{ value: string; label: string; icon: string }> = [
  { value: 'General', label: 'General', icon: 'bi-compass' },
  { value: 'Backend', label: 'Backend', icon: 'bi-hdd-rack' },
  { value: 'Frontend', label: 'Frontend', icon: 'bi-palette' },
  { value: 'AI', label: 'Inteligencia Artificial', icon: 'bi-robot' },
  { value: 'Cloud', label: 'Cloud & DevOps', icon: 'bi-cloud' },
];

@Component({
  selector: 'itera-dashboard-profile-page',
  standalone: true,
  imports: [DashboardShellComponent, FormsModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnInit {
  private readonly profileContentService = inject(ProfileContentService);
  private readonly profileApi = inject(ProfileApiService);
  private readonly dashboardContentService = inject(DashboardContentService);
  private readonly skillsApi = inject(SkillsApiService);
  private readonly authStorage = inject(AuthStorageService);
  private readonly router = inject(Router);

  protected readonly vm = this.dashboardContentService.vm;
  protected readonly currentTheme = this.profileContentService.currentTheme;
  protected readonly profile = this.profileContentService.profile;
  protected readonly isLoading = this.profileContentService.isLoading;
  protected readonly error = this.profileContentService.error;
  protected readonly academicGoals = ACADEMIC_GOALS_LIST;

  // Edit mode signals
  protected readonly isEditing = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly saveSuccess = signal<string | null>(null);
  protected readonly saveError = signal<string | null>(null);

  // Edit form state
  protected readonly editNames = signal('');
  protected readonly editSurnames = signal('');
  protected readonly editCycle = signal(1);
  protected readonly editAcademicGoal = signal('General');
  protected readonly editExperience = signal(0);
  protected readonly editSkills = signal<Skill[]>([]);

  // New skill form
  protected readonly newSkillName = signal('');
  protected readonly newSkillLevel = signal('beginner');
  protected readonly showSkillDropdown = signal(false);

  // Skills catalog from backend (154 skills organized by category)
  protected readonly skillsCatalog = signal<string[]>([]);

  // Filtered available skills (not already added) — uses catalog from backend
  protected readonly availableSkills = computed(() => {
    const current = this.editSkills();
    const currentNames = new Set(current.map((s) => s.name.toLowerCase()));
    const catalog = this.skillsCatalog();
    return catalog.filter((s) => !currentNames.has(s.toLowerCase()));
  });

  // Filtered available skills for search — returns up to 12 matches
  protected readonly filteredAvailableSkills = computed(() => {
    const search = this.newSkillName().toLowerCase().trim();
    const skills = this.availableSkills();
    if (!search) {
      // When no search, show skills matching the current level selection
      const level = this.newSkillLevel();
      return skills.slice(0, 12);
    }
    return skills.filter((s) => s.toLowerCase().includes(search)).slice(0, 12);
  });

  // Whether the skill input matches an existing skill in catalog
  protected readonly currentInputMatchesCatalog = computed(() => {
    const input = this.newSkillName().toLowerCase().trim();
    if (!input) return false;
    return this.skillsCatalog().some((s) => s.toLowerCase() === input);
  });

  // Profile stats
  protected readonly profileStats = computed(() => {
    const p = this.profile();
    return {
      skillCount: p?.skills?.length ?? 0,
      badgeCount: p?.badges?.length ?? 0,
      matchScore: p?.matchScore?.score ?? 0,
    };
  });

  // Badges derived from profile
  protected readonly badges = computed(() => {
    const p = this.profile();
    if (!p?.badges || !Array.isArray(p.badges) || p.badges.length === 0) {
      return [
        { label: 'Iniciado', icon: 'bi-award', earned: true },
        { label: 'Explorador', icon: 'bi-compass', earned: true },
        { label: 'Analista', icon: 'bi-stars', earned: false },
        { label: 'Constructor', icon: 'bi-box-seam', earned: false },
      ];
    }
    return p.badges.map((b: any) => ({
      label: b.name || b.label || 'Badge',
      icon: BADGE_ICON_MAP[b.name || b.label] || 'bi-patch-check',
      earned: b.earned ?? true,
    }));
  });

  protected readonly earnedBadgeCount = computed(
    () => this.badges().filter((b) => b.earned).length,
  );

  ngOnInit(): void {
    this.profileContentService.loadProfile();
    this.loadSkillsCatalog();

    setTimeout(() => {
      if (this.error() && !this.profile() && !this.isLoading()) {
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: '/dashboard/profile' },
        });
      }
    });
  }

  // --- Edit mode ---

  protected startEditing(): void {
    const p = this.profile();
    if (p) {
      this.editNames.set(p.names || '');
      this.editSurnames.set(p.surnames || '');
      this.editCycle.set(p.cycle || 1);
      this.editAcademicGoal.set(p.academicGoal || 'General');
      this.editExperience.set(p.experience || 0);
      this.editSkills.set([...(p.skills || [])]);
    }
    this.isEditing.set(true);
    this.saveSuccess.set(null);
    this.saveError.set(null);
  }

  protected cancelEditing(): void {
    this.isEditing.set(false);
    this.saveSuccess.set(null);
    this.saveError.set(null);
  }

  protected saveProfile(): void {
    const p = this.profile();
    if (!p) return;

    this.isSaving.set(true);
    this.saveError.set(null);

    this.profileApi
      .updateProfile({
        userId: p.userId,
        names: this.editNames(),
        surnames: this.editSurnames(),
        cycle: this.editCycle(),
        academicGoal: this.editAcademicGoal(),
        experience: this.editExperience(),
        skills: this.editSkills(),
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isEditing.set(false);
          this.saveSuccess.set('Perfil actualizado correctamente');
          this.profileContentService.loadProfile();
          setTimeout(() => this.saveSuccess.set(null), 3000);
        },
        error: (err) => {
          console.error('Error saving profile:', err);
          this.isSaving.set(false);
          this.saveError.set('No se pudo guardar el perfil. Intenta nuevamente.');
        },
      });
  }

  // --- Skills management ---

  protected addSkill(skillName: string): void {
    const name = skillName?.trim();
    if (!name) return;

    const current = this.editSkills();
    // Prevent duplicates (case-insensitive)
    if (current.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      this.newSkillName.set('');
      this.showSkillDropdown.set(false);
      return;
    }

    this.editSkills.set([...current, { name, level: this.newSkillLevel() }]);
    this.newSkillName.set('');
    this.showSkillDropdown.set(false);
  }

  protected addSkillFromInput(): void {
    const input = this.newSkillName().trim();
    if (!input) return;

    // Try exact match first (case-insensitive)
    const catalog = this.skillsCatalog();
    const exactMatch = catalog.find((s) => s.toLowerCase() === input.toLowerCase());

    if (exactMatch) {
      this.addSkill(exactMatch);
    } else {
      // Allow custom skills not in catalog
      this.addSkill(input);
    }
  }

  protected removeSkill(index: number): void {
    const current = [...this.editSkills()];
    current.splice(index, 1);
    this.editSkills.set(current);
  }

  protected updateSkillLevel(index: number, level: string): void {
    const current = [...this.editSkills()];
    current[index] = { ...current[index], level };
    this.editSkills.set(current);
  }

  protected skillLevelToPercent(level: string): number {
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

  private loadSkillsCatalog(): void {
    this.skillsApi.getCatalog().subscribe({
      next: (catalog) => {
        // Flatten all skills from all categories into a single list
        const allSkills = catalog.categories.flatMap((c) => c.skills);
        this.skillsCatalog.set(allSkills);
      },
      error: (err) => {
        console.error('Failed to load skills catalog:', err);
      },
    });
  }

  protected skillLevelLabel(level: string): string {
    switch (level?.toLowerCase()) {
      case 'advanced':
      case 'avanzado':
        return 'Avanzado';
      case 'intermediate':
      case 'intermedio':
        return 'Intermedio';
      case 'beginner':
      case 'principiante':
        return 'Principiante';
      default:
        return level;
    }
  }

  // --- Navigation ---

  protected readonly topNavItems = DASHBOARD_TOP_NAV_ITEMS;

  protected readonly sidebarItems = DASHBOARD_SIDEBAR_ITEMS.map((item) => ({
    ...item,
    active: item.href === '/dashboard/profile',
  }));
}
