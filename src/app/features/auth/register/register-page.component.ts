import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
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
        await this.router.navigateByUrl(result.redirectTo);
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
