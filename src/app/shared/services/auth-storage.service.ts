import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  private readonly TOKEN_KEY = 'itera_token';
  private readonly USER_ID_KEY = 'itera_user_id';

  readonly token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  saveSession(token: string, userId: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_ID_KEY, userId);
    this.token.set(token);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    this.token.set(null);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }
}
