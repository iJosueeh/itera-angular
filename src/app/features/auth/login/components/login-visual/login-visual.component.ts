import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LoginViewModel } from '@features/auth/interfaces/auth.interface';

@Component({
  selector: 'app-login-visual',
  templateUrl: './login-visual.component.html',
  styleUrl: './login-visual.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginVisualComponent {
  readonly vm = input.required<LoginViewModel>();
}
