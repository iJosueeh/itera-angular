import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

@Component({
  selector: 'itera-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  readonly brand = input<string>('Itera');
  readonly items = input<ReadonlyArray<NavItem>>([]);
  readonly showUserActions = input<boolean>(true);
}
