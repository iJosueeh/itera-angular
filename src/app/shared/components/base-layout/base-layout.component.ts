import { Component, input, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { type NavItem } from '../header/header.component';
import { type FooterLink } from '../footer/footer.component';

@Component({
  selector: 'itera-base-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  styleUrl: './base-layout.component.css',
  templateUrl: './base-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseLayoutComponent {
  /**
   * Type of layout: 'auth' for login/register (2 columns), 'full' for full-width pages
   */
  layoutType = input<'auth' | 'full'>('full');

  /**
   * Show header component
   */
  showHeader = input<boolean>(false);

  /**
   * Show footer component
   */
  showFooter = input<boolean>(false);

  /**
   * Header brand name
   */
  headerBrand = input<string>('Itera');

  /**
   * Header navigation items
   */
  headerItems = input<ReadonlyArray<NavItem>>([]);

  /**
   * Show user action buttons in header
   */
  headerShowUserActions = input<boolean>(true);

  /**
   * Footer brand name
   */
  footerBrand = input<string>('Itera');

  /**
   * Footer links
   */
  footerLinks = input<ReadonlyArray<FooterLink>>([]);

  /**
   * Content for the left panel (visual side, hidden on mobile)
   */
  leftPanelContent = input<TemplateRef<unknown> | null>(null);

  /**
   * Content for the right panel (form/main content)
   */
  rightPanelContent = input<TemplateRef<unknown> | null>(null);
}
