import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'itera-mentor-alert-card',
  standalone: true,
  templateUrl: './mentor-alert-card.component.html',
  styleUrl: './mentor-alert-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentorAlertCardComponent {
  title = input.required<string>();
  message = input.required<string>();
  buttonText = input<string>('Continue Learning');

  actionClick = output<void>();
}
