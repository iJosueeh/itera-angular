import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoginPayload, LoginViewModel } from '@features/auth/interfaces/auth.interface';

@Component({
  selector: 'itera-login-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly vm = input.required<LoginViewModel>();
  readonly isSubmitting = input(false);
  readonly submitLogin = output<LoginPayload>();
  readonly formError = signal<string | null>(null);

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.formError.set('Completa un correo valido y una contrasena de al menos 8 caracteres.');
      this.loginForm.markAllAsTouched();
      return;
    }

    this.formError.set(null);
    this.submitLogin.emit(this.loginForm.getRawValue());
  }
}
