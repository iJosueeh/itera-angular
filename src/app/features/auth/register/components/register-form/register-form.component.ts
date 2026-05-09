import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RegisterPayload, RegisterViewModel } from '@features/auth/interfaces/auth.interface';

@Component({
  selector: 'itera-register-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly vm = input.required<RegisterViewModel>();
  readonly isSubmitting = input(false);
  readonly submitRegister = output<RegisterPayload>();
  readonly formError = signal<string | null>(null);

  protected readonly registerForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/),
      ],
    ],
  });

  protected onSubmit(): void {
    if (this.registerForm.invalid) {
      this.formError.set('Completa nombre, correo valido y una contrasena con letras y numeros.');
      this.registerForm.markAllAsTouched();
      return;
    }

    this.formError.set(null);
    this.submitRegister.emit(this.registerForm.getRawValue());
  }
}
