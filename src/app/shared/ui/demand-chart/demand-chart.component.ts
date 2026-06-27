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
  metadata?: {
    fullLabel?: string;
    formattedValue?: string;
    minSalary?: number;
    maxSalary?: number;
    volume?: number;
    trend?: string;
  };
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

    const data = this.data();
    if (!data || data.length === 0) return;

    const width = container.clientWidth || 600;
    const height = 280;
    const padding = 40;
    const barWidth = Math.max(10, (width - padding * 2) / data.length);

    const svgns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgns, 'svg') as SVGSVGElement;
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    // Allow tooltip to overflow outside SVG bounds
    svg.style.overflow = 'visible';

    const maxValue = Math.max(...data.map((d) => d.value), 1);

    data.forEach((point, i) => {
      const barHeight = Math.max(0, (point.value / maxValue) * (height - padding * 2));
      const x = padding + i * barWidth;
      const y = height - padding - barHeight;

      const g = document.createElementNS(svgns, 'g');

      const rect = document.createElementNS(svgns, 'rect');
      rect.setAttribute('x', String(x + 5));
      rect.setAttribute('y', String(y));
      rect.setAttribute('width', String(Math.max(0, barWidth - 10)));
      rect.setAttribute('height', String(Math.max(0, barHeight)));
      rect.setAttribute('fill', this.color());
      rect.setAttribute('rx', '8');
      rect.style.cursor = 'pointer';

      // Hover tooltip
      rect.addEventListener('mouseenter', () => {
        gsap.to(rect, { fill: '#6a57f1', duration: 0.2 });
        const tooltipText = this.buildTooltipText(point);
        this.showTooltip(svg, svgns, x + barWidth / 2, y - 8, tooltipText);
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

  private buildTooltipText(point: ChartDataPoint): string[] {
    const lines: string[] = [];

    if (point.metadata) {
      // Rich tooltip for salary comparison
      lines.push(point.metadata.fullLabel || point.label);
      lines.push(
        `Promedio: ${point.metadata.formattedValue || this.formatNumber(point.value)} USD/año`,
      );
      if (point.metadata.minSalary !== undefined && point.metadata.maxSalary !== undefined) {
        lines.push(
          `Rango: ${this.formatNumber(point.metadata.minSalary)} — ${this.formatNumber(point.metadata.maxSalary)}`,
        );
      }
      if (point.metadata.volume !== undefined) {
        lines.push(`Ofertas: ${point.metadata.volume}`);
      }
      if (point.metadata.trend) {
        const trendIcon =
          point.metadata.trend === 'creciente'
            ? '↑'
            : point.metadata.trend === 'decreciente'
              ? '↓'
              : '→';
        lines.push(`Tendencia: ${trendIcon} ${point.metadata.trend}`);
      }
    } else {
      // Simple tooltip for other charts
      lines.push(`${point.label}: ${this.formatNumber(point.value)}`);
    }

    return lines;
  }

  private formatNumber(value: number): string {
    return value.toLocaleString('es-AR');
  }

  private showTooltip(svg: SVGSVGElement, ns: string, x: number, y: number, lines: string[]): void {
    this.hideTooltip();

    const g = document.createElementNS(ns, 'g') as SVGGElement;
    g.classList.add('chart-tooltip');
    // Ensure tooltip renders on top of other elements
    g.style.zIndex = '9999';
    g.style.pointerEvents = 'none';

    const padding = 10;
    const lineHeight = 16;
    const fontSize = 11;

    // Measure text width to size the background
    let maxWidth = 0;
    lines.forEach((line) => {
      const tempText = document.createElementNS(ns, 'text');
      tempText.setAttribute('font-size', String(fontSize));
      tempText.setAttribute('font-weight', '700');
      tempText.setAttribute('fill', '#ffffff');
      tempText.textContent = line;
      svg.appendChild(tempText);
      const bbox = (tempText as SVGTextElement).getBBox();
      svg.removeChild(tempText);
      maxWidth = Math.max(maxWidth, bbox.width);
    });

    const rectW = maxWidth + padding * 2;
    const rectH = lines.length * lineHeight + padding * 2;
    const rectX = x - rectW / 2;
    const rectY = y - rectH - 4;

    // Background
    const bg = document.createElementNS(ns, 'rect');
    bg.setAttribute('x', String(rectX));
    bg.setAttribute('y', String(rectY));
    bg.setAttribute('width', String(rectW));
    bg.setAttribute('height', String(rectH));
    bg.setAttribute('rx', '6');
    bg.setAttribute('fill', 'rgba(15,15,30,0.92)');
    bg.setAttribute('stroke', this.color());
    bg.setAttribute('stroke-width', '1');

    g.appendChild(bg);

    // Text lines
    lines.forEach((line, i) => {
      const txt = document.createElementNS(ns, 'text');
      txt.setAttribute('x', String(x));
      txt.setAttribute('y', String(rectY + padding + (i + 0.7) * lineHeight));
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-size', String(fontSize));
      txt.setAttribute('font-weight', i === 0 ? '700' : '500');
      txt.setAttribute('fill', i === 0 ? '#ffffff' : '#cbd5e1');
      txt.textContent = line;
      g.appendChild(txt);
    });

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
