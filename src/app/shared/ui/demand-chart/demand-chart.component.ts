import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, AfterViewInit, input, effect, inject } from '@angular/core';
import gsap from 'gsap';

export interface ChartDataPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'itera-demand-chart',
  standalone: true,
  template: `
    <div class="chart-container w-full h-[280px]" #container>
      <div #chart class="w-full h-full"></div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .chart-container { position: relative; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemandChartComponent implements AfterViewInit {
  data = input.required<ChartDataPoint[]>();
  color = input<string>('#4046b8');
  
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;
  @ViewChild('chart') chartElement!: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      if (this.data() && this.chartElement) {
        this.render();
      }
    });
  }

  ngAfterViewInit(): void {
    this.render();
    window.addEventListener('resize', () => this.render());
  }

  private render(): void {
    const container = this.chartElement.nativeElement;
    container.innerHTML = '';
    const width = container.clientWidth || 600;
    const height = 280;
    const padding = 40;
    const barWidth = (width - (padding * 2)) / this.data().length;

    const svgns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgns, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    const maxValue = Math.max(...this.data().map(d => d.value), 1);

    this.data().forEach((point, i) => {
      const barHeight = (point.value / maxValue) * (height - padding * 2);
      const x = padding + (i * barWidth);
      const y = height - padding - barHeight;

      const g = document.createElementNS(svgns, 'g');

      const rect = document.createElementNS(svgns, 'rect');
      rect.setAttribute('x', String(x + 5));
      rect.setAttribute('y', String(y));
      rect.setAttribute('width', String(barWidth - 10));
      rect.setAttribute('height', String(barHeight));
      rect.setAttribute('fill', this.color());
      rect.setAttribute('rx', '8');
      rect.style.cursor = 'pointer';

      // Tooltip logic (simpler than roadmap for speed)
      rect.addEventListener('mouseenter', () => {
        gsap.to(rect, { fill: '#6a57f1', duration: 0.2 });
      });
      rect.addEventListener('mouseleave', () => {
        gsap.to(rect, { fill: this.color(), duration: 0.2 });
      });

      const label = document.createElementNS(svgns, 'text');
      label.setAttribute('x', String(x + barWidth / 2));
      label.setAttribute('y', String(height - 15));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', '#8a90b7');
      label.setAttribute('font-size', '10');
      label.setAttribute('font-weight', '600');
      label.textContent = point.label.length > 8 ? point.label.slice(0, 5) + '...' : point.label;

      g.appendChild(rect);
      g.appendChild(label);
      svg.appendChild(g);

      // Animate entry
      gsap.from(rect, {
        height: 0,
        y: height - padding,
        duration: 0.8,
        delay: i * 0.05,
        ease: 'power2.out'
      });
    });

    container.appendChild(svg);
  }
}
