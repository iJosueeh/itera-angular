import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  private readonly TOKEN_KEY = 'itera_token';
  private readonly USER_ID_KEY = 'itera_user_id';
  private readonly AUTH_FLAG_KEY = 'itera_is_authenticated';

  readonly isAuthenticated = signal<boolean>(localStorage.getItem(this.AUTH_FLAG_KEY) === 'true');

  saveSession(token: string, userId: string): void {
    // Note: token might be empty if using HttpOnly cookies
    if (token) localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_ID_KEY, userId);
    localStorage.setItem(this.AUTH_FLAG_KEY, 'true');
    this.isAuthenticated.set(true);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.AUTH_FLAG_KEY);
    this.isAuthenticated.set(false);
  }
}
