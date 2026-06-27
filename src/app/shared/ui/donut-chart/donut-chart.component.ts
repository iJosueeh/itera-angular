import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  input,
  effect,
} from '@angular/core';
import gsap from 'gsap';

export interface SkillDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: {
    trend?: string;
    percentage?: number;
  };
}

@Component({
  selector: 'itera-donut-chart',
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
export class DonutChartComponent implements AfterViewInit {
  data = input.required<SkillDataPoint[]>();

  @ViewChild('container') container!: ElementRef<HTMLDivElement>;
  @ViewChild('chart') chartElement!: ElementRef<HTMLDivElement>;

  private activeTooltip: SVGGElement | null = null;

  private readonly COLORS = [
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
    '#f59e0b',
    '#10b981',
  ];

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

    const width = container.clientWidth || 280;
    const height = 280;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 20;
    const innerRadius = outerRadius * 0.6;

    const svgns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgns, 'svg') as SVGSVGElement;
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.overflow = 'visible';

    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = -Math.PI / 2; // Start from top

    data.forEach((point, i) => {
      const sliceAngle = (point.value / total) * Math.PI * 2;
      const color = point.color || this.COLORS[i % this.COLORS.length];

      // Create arc path
      const path = this.createArcPath(
        centerX,
        centerY,
        innerRadius,
        outerRadius,
        currentAngle,
        currentAngle + sliceAngle,
      );

      const slice = document.createElementNS(svgns, 'path');
      slice.setAttribute('d', path);
      slice.setAttribute('fill', color);
      slice.setAttribute('stroke', '#ffffff');
      slice.setAttribute('stroke-width', '2');
      slice.style.cursor = 'pointer';
      slice.style.transition = 'transform 0.2s';

      // Hover effects
      slice.addEventListener('mouseenter', () => {
        gsap.to(slice, { scale: 1.05, transformOrigin: 'center' });
        const percentage = ((point.value / total) * 100).toFixed(1);
        const tooltipText = [
          point.label,
          `${percentage}% (${point.value} ofertas)`,
          point.metadata?.trend ? `Tendencia: ${point.metadata.trend}` : '',
        ].filter(Boolean);
        this.showTooltip(svg, svgns, centerX, centerY - outerRadius - 20, tooltipText);
      });

      slice.addEventListener('mouseleave', () => {
        gsap.to(slice, { scale: 1, transformOrigin: 'center' });
        this.hideTooltip();
      });

      svg.appendChild(slice);

      // Animate entry
      gsap.from(slice, {
        opacity: 0,
        scale: 0.8,
        transformOrigin: 'center',
        duration: 0.6,
        delay: i * 0.05,
        ease: 'power2.out',
      });

      currentAngle += sliceAngle;
    });

    // Center text
    const centerText = document.createElementNS(svgns, 'text');
    centerText.setAttribute('x', String(centerX));
    centerText.setAttribute('y', String(centerY - 5));
    centerText.setAttribute('text-anchor', 'middle');
    centerText.setAttribute('font-size', '24');
    centerText.setAttribute('font-weight', '700');
    centerText.setAttribute('fill', '#1e293b');
    centerText.textContent = String(data.length);
    svg.appendChild(centerText);

    const subText = document.createElementNS(svgns, 'text');
    subText.setAttribute('x', String(centerX));
    subText.setAttribute('y', String(centerY + 15));
    subText.setAttribute('text-anchor', 'middle');
    subText.setAttribute('font-size', '11');
    subText.setAttribute('fill', '#64748b');
    subText.textContent = 'skills';
    svg.appendChild(subText);

    container.appendChild(svg);
  }

  private createArcPath(
    cx: number,
    cy: number,
    innerR: number,
    outerR: number,
    startAngle: number,
    endAngle: number,
  ): string {
    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');
  }

  private showTooltip(svg: SVGSVGElement, ns: string, x: number, y: number, lines: string[]): void {
    this.hideTooltip();

    const g = document.createElementNS(ns, 'g') as SVGGElement;
    g.classList.add('chart-tooltip');
    g.style.zIndex = '9999';
    g.style.pointerEvents = 'none';

    const padding = 10;
    const lineHeight = 16;
    const fontSize = 11;

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

    const bg = document.createElementNS(ns, 'rect');
    bg.setAttribute('x', String(rectX));
    bg.setAttribute('y', String(rectY));
    bg.setAttribute('width', String(rectW));
    bg.setAttribute('height', String(rectH));
    bg.setAttribute('rx', '6');
    bg.setAttribute('fill', 'rgba(15,15,30,0.92)');
    bg.setAttribute('stroke', '#6366f1');
    bg.setAttribute('stroke-width', '1');

    g.appendChild(bg);

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
