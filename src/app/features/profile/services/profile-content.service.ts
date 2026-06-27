import { inject, Injectable, signal, computed } from '@angular/core';
import { ProfileApiService } from './profile-api.service';
import { StudentProfile } from '@shared/interfaces/profile.interface';
import { take, of, Observable, tap, finalize, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileContentService {
  private readonly profileApi = inject(ProfileApiService);

  private readonly profileState = signal<StudentProfile | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Computed signals for specific parts of the enriched profile
  readonly profile = computed(() => this.profileState());
  readonly roadmap = computed(() => this.profileState()?.roadmap);
  readonly matchScore = computed(() => this.profileState()?.matchScore);
  readonly recommendations = computed(() => this.profileState()?.recommendations);

  readonly currentTheme = computed(() => 'light');

  loadProfile(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.profileApi
      .getProfile()
      .pipe(
        take(1),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (data) => {
          console.log(`[Profile] loadProfile → academicGoal: "${data.academicGoal}"`);
          this.profileState.set(data);
        },
        error: (err) => {
          console.error('[Profile] Error loading profile:', err);
          this.error.set('Error al cargar el perfil académico.');
        },
      });
  }

  updateAcademicGoal(goal: string): Observable<StudentProfile> {
    const current = this.profileState();
    if (!current) return of(null as any);

    this.isLoading.set(true);
    this.error.set(null);

    const payload = { userId: current.userId, academicGoal: goal };
    console.log(`[Profile] updateAcademicGoal → PUT payload:`, payload);
    return this.profileApi.updateProfile(payload).pipe(
      tap({
        next: () => {
          console.log(
            `[Profile] updateAcademicGoal → PUT OK, merging goal "${goal}" into profileState`,
          );
          // Merge new goal directly into current profile — no GET needed.
          // This avoids a race condition where getProfile() might return
          // stale data from a goals table that hasn't committed yet.
          this.profileState.set({ ...current, academicGoal: goal });
        },
        error: (err) => {
          console.error('[Profile] Error updating goal:', err);
          this.error.set('No se pudo actualizar el objetivo académico.');
        },
      }),
      finalize(() => this.isLoading.set(false)),
      map(() => ({ ...current, academicGoal: goal })),
      take(1),
    );
  }
}
