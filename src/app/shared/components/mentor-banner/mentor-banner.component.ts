import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MentorSuggestion } from '../../interfaces/dashboard.interface';

@Component({
  selector: 'itera-mentor-banner',
  templateUrl: './mentor-banner.component.html',
  styleUrl: './mentor-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentorBannerComponent {
  readonly mentor = input.required<MentorSuggestion>();
}
