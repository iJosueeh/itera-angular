import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, tap, of } from 'rxjs';
import { AuthResult, LoginPayload, RegisterPayload } from '../interfaces/auth.interface';
import { AuthStorageService } from '@shared/services/auth-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly authStorage = inject(AuthStorageService);
  private readonly baseUrl = '/api/core/auth'; // Using relative path for proxy

  signIn(payload: LoginPayload): Observable<AuthResult> {
    return this.http.post<any>(`${this.baseUrl}/login`, payload).pipe(
      tap((response) => {
        if (response.userId) {
          this.authStorage.saveSession('', response.userId); // Token is now in cookie
        }
      }),
      map((response) => ({
        success: true,
        message: `Bienvenido, ${response.email}.`,
        redirectTo: '/dashboard',
      })),
      catchError((error) => {
        const message = error.error?.message || 'Error al iniciar sesión';
        return of({ success: false, message, redirectTo: '' });
      }),
    );
  }

  signUp(payload: RegisterPayload): Observable<AuthResult> {
    // Note: The backend expects { email, password } for now based on AuthCommands.scala
    const registerCmd = {
      email: payload.email,
      password: payload.password,
    };

    return this.http.post<any>(`${this.baseUrl}/register`, registerCmd).pipe(
      map(() => ({
        success: true,
        message: 'Cuenta creada exitosamente. Ya puedes iniciar sesión.',
        redirectTo: '/login',
      })),
      catchError((error) => {
        const message = error.error?.message || 'Error al registrarse';
        return of({ success: false, message, redirectTo: '' });
      }),
    );
  }
}
