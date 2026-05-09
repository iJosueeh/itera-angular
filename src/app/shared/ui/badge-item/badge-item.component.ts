import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'itera-badge-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-item.component.html',
  styleUrl: './badge-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeItemComponent {
  label = input.required<string>();
  icon = input.required<string>();
  earned = input<boolean>(false);
}
