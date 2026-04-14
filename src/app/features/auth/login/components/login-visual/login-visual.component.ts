import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LoginViewModel } from '../../../interfaces/auth.interface';

@Component({
  selector: 'itera-login-visual',
  templateUrl: './login-visual.component.html',
  styleUrl: './login-visual.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginVisualComponent {
  readonly vm = input.required<LoginViewModel>();
}
