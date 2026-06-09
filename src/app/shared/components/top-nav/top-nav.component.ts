import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '@shared/interfaces/dashboard.interface';
import { AuthStorageService } from '@shared/services/auth-storage.service';

@Component({
  selector: 'itera-top-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopNavComponent {
  private readonly authStorage = inject(AuthStorageService);

  readonly brand = input<string>('Itera');
  readonly items = input<ReadonlyArray<NavItem>>([]);

  readonly isAuthenticated = this.authStorage.isAuthenticated;

  logout(): void {
    this.authStorage.clearSession();
    window.location.href = '/';
  }
}
