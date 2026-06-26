import { ChangeDetectionStrategy, Component, input, computed, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface TrustMetric {
  icon: string;
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

@Component({
  selector: 'itera-trust-indicators',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './trust-indicators.component.html',
  styleUrl: './trust-indicators.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrustIndicatorsComponent implements OnInit {
  readonly metrics = input.required<ReadonlyArray<TrustMetric>>();
  readonly animated = input<boolean>(true);

  protected readonly displayValues = signal<Map<number, number>>(new Map());

  ngOnInit(): void {
    if (this.animated()) {
      this.animateCountUp();
    } else {
      this.setFinalValues();
    }
  }

  private setFinalValues(): void {
    const values = new Map<number, number>();
    this.metrics().forEach((metric, index) => {
      values.set(index, metric.value);
    });
    this.displayValues.set(values);
  }

  private animateCountUp(): void {
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const animate = () => {
      currentStep++;
      const progress = currentStep / steps;
      const eased = this.easeOutCubic(progress);

      const values = new Map<number, number>();
      this.metrics().forEach((metric, index) => {
        values.set(index, Math.floor(metric.value * eased));
      });
      this.displayValues.set(values);

      if (currentStep < steps) {
        setTimeout(animate, stepDuration);
      } else {
        this.setFinalValues();
      }
    };

    setTimeout(animate, 200);
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  protected getDisplayValue(index: number): number {
    return this.displayValues().get(index) ?? 0;
  }
}
