import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NavItem } from '../../interfaces/dashboard.interface';

@Component({
  selector: 'itera-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopNavComponent {
  readonly brand = input.required<string>();
  readonly items = input.required<ReadonlyArray<NavItem>>();
}
