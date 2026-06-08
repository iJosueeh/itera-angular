import { inject, Injectable, signal, computed } from '@angular/core';
import { ProfileApiService } from './profile-api.service';
import { StudentProfile } from '@shared/interfaces/profile.interface';
import { take } from 'rxjs';

@Injectable()
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

  loadProfile(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.profileApi.getProfile()
      .pipe(take(1))
      .subscribe({
        next: (data) => this.profileState.set(data),
        error: (err) => {
          console.error('Error loading profile:', err);
          this.error.set('Error al cargar el perfil académico.');
        },
        complete: () => this.isLoading.set(false)
      });
  }
}
