import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  input,
  output,
  effect,
  inject,
} from '@angular/core';
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
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .chart-container {
        position: relative;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemandChartComponent implements AfterViewInit {
  data = input.required<ChartDataPoint[]>();
  color = input<string>('#4046b8');

  barClick = output<ChartDataPoint>();

  @ViewChild('container') container!: ElementRef<HTMLDivElement>;
  @ViewChild('chart') chartElement!: ElementRef<HTMLDivElement>;

  private activeTooltip: SVGGElement | null = null;

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
    this.activeTooltip = null;

    const width = container.clientWidth || 600;
    const height = 280;
    const padding = 40;
    const barWidth = (width - padding * 2) / this.data().length;

    const svgns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgns, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const maxValue = Math.max(...this.data().map((d) => d.value), 1);

    this.data().forEach((point, i) => {
      const barHeight = (point.value / maxValue) * (height - padding * 2);
      const x = padding + i * barWidth;
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

      // Hover tooltip
      rect.addEventListener('mouseenter', () => {
        gsap.to(rect, { fill: '#6a57f1', duration: 0.2 });
        this.showTooltip(svg, svgns, x + barWidth / 2, y - 8, `${point.label}: ${point.value}`);
      });
      rect.addEventListener('mouseleave', () => {
        gsap.to(rect, { fill: this.color(), duration: 0.2 });
        this.hideTooltip();
      });

      // Click drill-down
      rect.addEventListener('click', () => {
        this.barClick.emit(point);
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
        ease: 'power2.out',
      });
    });

    container.appendChild(svg);
  }

  private showTooltip(svg: SVGSVGElement, ns: string, x: number, y: number, text: string): void {
    this.hideTooltip();

    const g = document.createElementNS(ns, 'g');
    g.classList.add('chart-tooltip');

    const padding = 8;
    const tempText = document.createElementNS(ns, 'text');
    tempText.setAttribute('font-size', '11');
    tempText.setAttribute('font-weight', '700');
    tempText.setAttribute('fill', '#ffffff');
    tempText.textContent = text;
    svg.appendChild(tempText);
    const bbox = (tempText as SVGTextElement).getBBox();
    svg.removeChild(tempText);

    const rectW = bbox.width + padding * 2;
    const rectH = bbox.height + padding * 2;
    const rectX = x - rectW / 2;
    const rectY = y - rectH - 4;

    const bg = document.createElementNS(ns, 'rect');
    bg.setAttribute('x', String(rectX));
    bg.setAttribute('y', String(rectY));
    bg.setAttribute('width', String(rectW));
    bg.setAttribute('height', String(rectH));
    bg.setAttribute('rx', '6');
    bg.setAttribute('fill', 'rgba(15,15,30,0.92)');
    bg.setAttribute('stroke', this.color());
    bg.setAttribute('stroke-width', '1');

    const txt = document.createElementNS(ns, 'text');
    txt.setAttribute('x', String(x));
    txt.setAttribute('y', String(rectY + rectH / 2 + 4));
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', '11');
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('fill', '#ffffff');
    txt.textContent = text;

    g.appendChild(bg);
    g.appendChild(txt);
    svg.appendChild(g);
    this.activeTooltip = g as SVGGElement;

    gsap.from(g, { opacity: 0, y: 6, duration: 0.2 });
  }

  private hideTooltip(): void {
    if (this.activeTooltip) {
      this.activeTooltip.remove();
      this.activeTooltip = null;
    }
  }
}
