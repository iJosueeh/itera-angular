import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginPayload } from '@features/auth/interfaces/auth.interface';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { LoginVisualComponent } from './components/login-visual/login-visual.component';
import { LoginContentService } from './services/login-content.service';

@Component({
  selector: 'itera-login-page',
  standalone: true,
  imports: [LoginVisualComponent, LoginFormComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly loginContentService = inject(LoginContentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly vm = this.loginContentService.vm;
  protected readonly isSubmitting = signal(false);
  protected readonly responseMessage = signal<string | null>(null);
  protected readonly responseError = signal<string | null>(null);

  protected async onSubmit(payload: LoginPayload): Promise<void> {
    this.isSubmitting.set(true);
    this.responseError.set(null);
    this.responseMessage.set(null);

    try {
      const result = await firstValueFrom(this.loginContentService.signIn(payload));

      if (result.success) {
        this.responseMessage.set(result.message);

        // Read returnUrl from query params; fall back to default redirect
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const target = returnUrl || result.redirectTo;
        await this.router.navigateByUrl(target);
      } else {
        this.responseError.set(result.message);
      }
    } catch {
      this.responseError.set('No se pudo establecer conexión con el servidor.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
