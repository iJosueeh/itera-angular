import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterPayload } from '@features/auth/interfaces/auth.interface';
import { RegisterFormComponent } from './components/register-form/register-form.component';
import { RegisterVisualComponent } from './components/register-visual/register-visual.component';
import { RegisterContentService } from './services/register-content.service';

@Component({
  selector: 'itera-register-page',
  standalone: true,
  imports: [RegisterVisualComponent, RegisterFormComponent],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
  private readonly registerContentService = inject(RegisterContentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly vm = this.registerContentService.vm;
  protected readonly isSubmitting = signal(false);
  protected readonly responseMessage = signal<string | null>(null);
  protected readonly responseError = signal<string | null>(null);

  protected async onSubmit(payload: RegisterPayload): Promise<void> {
    this.isSubmitting.set(true);
    this.responseError.set(null);
    this.responseMessage.set(null);

    try {
      const result = await firstValueFrom(this.registerContentService.signUp(payload));

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
      this.responseError.set('No se pudo completar el registro. Intenta nuevamente.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
