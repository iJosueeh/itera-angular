import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { TopNavComponent } from '../top-nav/top-nav.component';
import { FooterLink, NavItem } from '@shared/interfaces/dashboard.interface';

@Component({
  selector: 'itera-dashboard-shell',
  standalone: true,
  imports: [RouterLink, TopNavComponent, FooterComponent],
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardShellComponent {
  readonly brand = input<string>('Itera');
  readonly theme = input<string>('light');
  readonly topNavItems = input<ReadonlyArray<NavItem>>([]);
  readonly sidebarItems = input<ReadonlyArray<NavItem>>([]);
  readonly sidebarTitle = input<string>('Panel de Control');
  readonly sidebarStatus = input<string>('Mentor IA Activo');
  readonly footerLinks = input<ReadonlyArray<FooterLink>>([]);
}
