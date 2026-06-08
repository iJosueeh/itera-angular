import { AfterViewInit, Component, ElementRef, ViewChild, inject, effect } from '@angular/core';
import { ProfileContentService } from '@features/profile/services/profile-content.service';
import gsap from 'gsap';

@Component({
  selector: 'itera-interactive-roadmap',
  standalone: true,
  templateUrl: './interactive-roadmap.component.html',
  styleUrls: ['./interactive-roadmap.component.css'],
})
export class InteractiveRoadmapComponent implements AfterViewInit {
  private readonly profileContentService = inject(ProfileContentService);
  @ViewChild('chart', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      const roadmap = this.profileContentService.roadmap();
      if (roadmap) {
        this.renderChart(roadmap);
      }
    });
  }

  ngAfterViewInit(): void {
    const currentRoadmap = this.profileContentService.roadmap();
    this.renderChart(currentRoadmap);
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    const container = this.chartContainer?.nativeElement;
    if (container) {
      container.innerHTML = '';
      this.renderChart(this.profileContentService.roadmap());
    }
  }

  private renderChart(realData?: any): void {
    const container = this.chartContainer.nativeElement;
    container.innerHTML = ''; // Clear previous
    const width = container.clientWidth || 800;
    const height = 200;

    const svgns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgns, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.overflow = 'visible';

    let nodes = [
      { id: 'foundation', x: 80, y: 120, label: 'Foundation', status: 'completed' },
      { id: 'cloud', x: Math.min(240, width * 0.3), y: 70, label: 'Cloud', status: 'attention' },
      {
        id: 'k8s',
        x: Math.min(420, width * 0.55),
        y: 120,
        label: 'K8s Orchestration',
        status: 'planned',
      },
      {
        id: 'goal',
        x: Math.min(620, width * 0.85),
        y: 80,
        label: 'Chief Architect',
        status: 'goal',
      },
    ];

    if (realData && Array.isArray(realData)) {
       // Simple mapping for demo
       nodes = realData.map((n, i) => ({
         id: n.id || `node-${i}`,
         x: 80 + (i * (width - 160) / (realData.length - 1 || 1)),
         y: i % 2 === 0 ? 120 : 70,
         label: n.name || n.label || 'Step',
         status: n.status || 'planned'
       }));
    }

    const d = nodes.reduce((acc, p, i, arr) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = arr[i - 1];
      const cx1 = (prev.x + p.x) / 2;
      const cy1 = prev.y;
      const cx2 = (prev.x + p.x) / 2;
      const cy2 = p.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
    }, '');

    const path = document.createElementNS(svgns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#e6e9ff');
    path.setAttribute('stroke-width', '4');
    svg.appendChild(path);

    const prevTooltip = document.querySelector('.roadmap-tooltip');
    if (prevTooltip) prevTooltip.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'roadmap-tooltip';
    tooltip.style.position = 'fixed';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.padding = '6px 10px';
    tooltip.style.background = '#111827';
    tooltip.style.color = '#fff';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontSize = '12px';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 120ms ease, transform 120ms ease';
    tooltip.style.willChange = 'transform, opacity';
    document.body.appendChild(tooltip);

    const circleElements: SVGCircleElement[] = [];

    nodes.forEach((n) => {
      const g = document.createElementNS(svgns, 'g');
      g.setAttribute('transform', `translate(${n.x},${n.y})`);

      const circle = document.createElementNS(svgns, 'circle');
      circle.setAttribute('r', '26');
      circle.setAttribute(
        'fill',
        n.status === 'completed' ? '#2dd4bf' : n.status === 'attention' ? '#ff6b6b' : '#a3b0ff',
      );
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '4');
      circle.style.cursor = 'pointer';

      circleElements.push(circle as unknown as SVGCircleElement);

      circle.addEventListener('mouseover', () => {
        circle.setAttribute('r', '32');
        tooltip.innerHTML = `<strong>${n.label}</strong>`;
        tooltip.style.opacity = '1';
      });
      circle.addEventListener('mousemove', (ev: MouseEvent) => {
        tooltip.style.left = ev.clientX + 12 + 'px';
        tooltip.style.top = ev.clientY - 28 + 'px';
      });
      circle.addEventListener('mouseout', () => {
        circle.setAttribute('r', '26');
        tooltip.style.opacity = '0';
      });

      const text = document.createElementNS(svgns, 'text');
      text.setAttribute('y', '52');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#2f327d');
      text.setAttribute('font-size', '12');
      text.textContent = n.label.length > 18 ? n.label.slice(0, 15) + '...' : n.label;

      g.appendChild(circle);
      g.appendChild(text);
      svg.appendChild(g);
    });

    container.appendChild(svg);

    try {
      const pathLength = (path as SVGPathElement).getTotalLength();
      path.style.strokeDasharray = String(pathLength);
      path.style.strokeDashoffset = String(pathLength);

      gsap.to(path.style, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'power2.out',
      });

      gsap.fromTo(
        circleElements,
        { scale: 0, transformOrigin: '50% 50%' },
        { scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(1.4)' },
      );

      circleElements.forEach((c, idx) => {
        const status = nodes[idx].status;
        if (status === 'attention') {
          gsap.to(c, {
            scale: 1.08,
            transformOrigin: '50% 50%',
            repeat: -1,
            yoyo: true,
            duration: 1.2,
            ease: 'sine.inOut',
          });
        }
      });
    } catch (err) {
      // if GSAP or SVG path methods fail, silently continue
    }
  }
}
