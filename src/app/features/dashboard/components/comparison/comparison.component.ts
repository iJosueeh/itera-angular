import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ComparisonOption {
  label: string;
  title: string;
  subtitle: string;
  accent: 'indigo' | 'emerald';
  salary: string;
  growth: string;
  stack: ReadonlyArray<string>;
  projectionBars: ReadonlyArray<number>;
}

interface MetricRow {
  metric: string;
  optionA: string;
  optionB: string;
  outcome: string;
  tone: 'neutral' | 'indigo' | 'emerald';
}

@Component({
  selector: 'itera-comparison-panel',
  standalone: true,
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComparisonComponent {
  protected readonly title = 'Path Comparator';
  protected readonly subtitle =
    'A deep-dive analytical comparison between your top two potential career pivots. Leverage data-driven growth projections and cost-benefit analysis.';

  protected readonly options: ReadonlyArray<ComparisonOption> = [
    {
      label: 'Option A',
      title: 'Software Engineering',
      subtitle: 'Specializing in Full-Stack Development & Distributed Systems.',
      accent: 'indigo',
      salary: '$128,400',
      growth: '+22%',
      stack: ['TypeScript', 'Rust', 'Kubernetes', 'Go'],
      projectionBars: [18, 26, 34, 43, 58]
    },
    {
      label: 'Option B',
      title: 'Data Science',
      subtitle: 'Specializing in Machine Learning & Predictive Analytics.',
      accent: 'emerald',
      salary: '$135,200',
      growth: '+36%',
      stack: ['Python', 'PyTorch', 'SQL', 'Pandas'],
      projectionBars: [12, 24, 38, 46, 54]
    }
  ];

  protected readonly metricRows: ReadonlyArray<MetricRow> = [
    {
      metric: 'Total Learning Time',
      optionA: '8 Months (Intensive)',
      optionB: '14 Months (Academic)',
      outcome: 'Faster pivot',
      tone: 'indigo'
    },
    {
      metric: 'Opportunity Cost',
      optionA: '$45,000 (Loss of Wages)',
      optionB: '$82,000 (Loss of Wages)',
      outcome: 'Lower risk',
      tone: 'neutral'
    },
    {
      metric: 'Entry Difficulty',
      optionA: 'Medium (Project Based)',
      optionB: 'High (Math Intensive)',
      outcome: 'Higher barrier',
      tone: 'emerald'
    },
    {
      metric: 'Market Saturation',
      optionA: 'High (Junior Level)',
      optionB: 'Low (Specialized Level)',
      outcome: '$ scarcity premium',
      tone: 'emerald'
    }
  ];

  protected readonly mentorSummary =
    'Based on your previous 4 years in Marketing, Data Science offers a stronger long-term ROI. While the learning curve is 40% steeper, your existing domain expertise in consumer analytics makes you a "T-Shaped" candidate. Software Engineering would be a total reset, whereas Data Science is a force multiplier for your career.';
}
