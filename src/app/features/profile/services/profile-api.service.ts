import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentProfile, InitializeProfilePayload, UpdateProfilePayload } from '@shared/interfaces/profile.interface';

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/core/profile';

  getProfile(): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(this.baseUrl);
  }

  initializeProfile(payload: InitializeProfilePayload): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/initialize`, payload);
  }

  updateProfile(payload: UpdateProfilePayload): Observable<void> {
    return this.http.put<void>(this.baseUrl, payload);
  }
}
