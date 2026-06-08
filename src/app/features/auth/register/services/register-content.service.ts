import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AuthResult,
  RegisterPayload,
  RegisterViewModel,
} from '@features/auth/interfaces/auth.interface';
import { REGISTER_VIEW_MODEL_MOCK } from '../mocks/register.mock';
import { AuthApiService } from '@features/auth/services/auth-api.service';

@Injectable({ providedIn: 'root' })
export class RegisterContentService {
  private readonly authApiService = inject(AuthApiService);
  readonly vm = signal<RegisterViewModel>(REGISTER_VIEW_MODEL_MOCK);

  signUp(payload: RegisterPayload): Observable<AuthResult> {
    return this.authApiService.signUp(payload);
  }
}
