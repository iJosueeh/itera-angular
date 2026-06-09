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
      // Re-render when roadmap or theme changes
      this.profileContentService.currentTheme(); 
      this.renderChart(roadmap);
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
    container.innerHTML = ''; 
    const width = container.clientWidth || 800;
    const height = 200;

    const svgns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgns, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.overflow = 'visible';

    let nodes = [
      { id: 'foundation', x: 80, y: 120, label: 'Fundamentos', status: 'completed' },
      { id: 'logic', x: Math.min(240, width * 0.3), y: 70, label: 'Lógica Técnica', status: 'attention' },
      {
        id: 'specialization',
        x: Math.min(420, width * 0.55),
        y: 120,
        label: 'Especialización',
        status: 'planned',
      },
      {
        id: 'goal',
        x: Math.min(620, width * 0.85),
        y: 80,
        label: 'Objetivo Final',
        status: 'goal',
      },
    ];

    if (realData && Array.isArray(realData)) {
       nodes = realData.map((n, i) => ({
         id: n.id || `node-${i}`,
         x: 80 + (i * (width - 160) / (realData.length - 1 || 1)),
         y: i % 2 === 0 ? 120 : 70,
         label: n.name || n.label || 'Paso',
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
    path.setAttribute('stroke', 'rgba(99, 102, 241, 0.1)');
    path.setAttribute('stroke-width', '4');
    svg.appendChild(path);

    const theme = this.profileContentService.currentTheme();
    const primaryColor = theme === 'synthwave' ? '#a855f7' : '#6366f1';
    const secondaryColor = theme === 'night' ? '#38bdf8' : '#818cf8';

    const circleElements: SVGCircleElement[] = [];

    nodes.forEach((n) => {
      const g = document.createElementNS(svgns, 'g');
      g.setAttribute('transform', `translate(${n.x},${n.y})`);

      const circle = document.createElementNS(svgns, 'circle');
      circle.setAttribute('r', '26');
      
      let nodeColor = '#312e81'; 
      if (n.status === 'completed') nodeColor = primaryColor;
      else if (n.status === 'attention') nodeColor = '#f43f5e'; 
      else if (n.status === 'goal') nodeColor = secondaryColor;
      else nodeColor = 'rgba(255,255,255,0.05)';

      circle.setAttribute('fill', nodeColor);
      circle.setAttribute('stroke', 'rgba(255,255,255,0.1)');
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'pointer';

      circleElements.push(circle as unknown as SVGCircleElement);

      const text = document.createElementNS(svgns, 'text');
      text.setAttribute('y', '52');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'rgba(255,255,255,0.5)');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-weight', 'bold');
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
    } catch (err) {}
  }
}
