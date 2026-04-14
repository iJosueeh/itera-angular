import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface FooterLink {
  label: string;
  href: string;
}

@Component({
  selector: 'itera-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  readonly brand = input<string>('Itera');
  readonly links = input<ReadonlyArray<FooterLink>>([]);
  readonly copyright = input<string>('© 2026 Itera AI Mentor. Todos los derechos reservados.');
}
