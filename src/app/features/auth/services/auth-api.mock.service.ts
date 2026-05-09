import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  AuthResult,
  LoginPayload,
  RegisterPayload,
} from '@features/auth/interfaces/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthApiMockService {
  signIn(payload: LoginPayload): Observable<AuthResult> {
    const normalizedEmail = payload.email.trim().toLowerCase();

    const result: AuthResult = {
      success: true,
      message: `Bienvenido de nuevo, ${normalizedEmail}. Tu panel de mentor ya esta listo.`,
      redirectTo: '/dashboard',
    };

    return of(result).pipe(delay(900));
  }

  signUp(payload: RegisterPayload): Observable<AuthResult> {
    const firstName = payload.fullName.trim().split(' ')[0] ?? 'estudiante';

    const result: AuthResult = {
      success: true,
      message: `${firstName}, tu cuenta fue creada. Ahora puedes comparar carreras y ver rutas personalizadas.`,
      redirectTo: '/dashboard',
    };

    return of(result).pipe(delay(1100));
  }
}
