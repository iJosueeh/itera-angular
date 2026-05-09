import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'itera-stat-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-bar.component.html',
  styleUrl: './stat-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatBarComponent {
  label = input.required<string>();
  value = input.required<number>();
  color = input<string>('#4046b8'); // Default indigo
}
