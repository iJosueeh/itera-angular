import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RegisterViewModel } from '../../../interfaces/auth.interface';

@Component({
  selector: 'itera-register-visual',
  templateUrl: './register-visual.component.html',
  styleUrl: './register-visual.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterVisualComponent {
  readonly vm = input.required<RegisterViewModel>();
}
