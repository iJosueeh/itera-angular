import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResult, LoginPayload, LoginViewModel } from '@features/auth/interfaces/auth.interface';
import { LOGIN_VIEW_MODEL_MOCK } from '../mocks/login.mock';
import { AuthApiMockService } from '@features/auth/services/auth-api.mock.service';

@Injectable({ providedIn: 'root' })
export class LoginContentService {
  private readonly authApiMockService = inject(AuthApiMockService);
  readonly vm = signal<LoginViewModel>(LOGIN_VIEW_MODEL_MOCK);

  signIn(payload: LoginPayload): Observable<AuthResult> {
    return this.authApiMockService.signIn(payload);
  }
}
