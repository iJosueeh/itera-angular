import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../../interfaces/dashboard.interface';

@Component({
  selector: 'itera-top-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopNavComponent {
  readonly brand = input<string>('Itera');
  readonly items = input<ReadonlyArray<NavItem>>([]);
}
