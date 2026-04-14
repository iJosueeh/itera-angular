import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FooterLink } from '../../interfaces/dashboard.interface';

@Component({
  selector: 'itera-site-footer',
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteFooterComponent {
  readonly brand = input.required<string>();
  readonly links = input.required<ReadonlyArray<FooterLink>>();
}
