export interface NavItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}

export interface TrendItem {
  label: string;
}

export interface HeroContent {
  badge: string;
  titleLead: string;
  titleAccent: string;
  subtitle: string;
  placeholder: string;
  primaryAction: string;
  trends: ReadonlyArray<TrendItem>;
}

export interface FeatureCard {
  title: string;
  description: string;
  icon: string;
  cta?: string;
  tone: 'neutral' | 'accent' | 'muted';
}

export interface ProgressCard {
  title: string;
  description: string;
  progressLabel: string;
  progressValue: number;
}

export interface MentorSuggestion {
  avatarAlt: string;
  avatarInitials: string;
  mentorName: string;
  messagePrefix: string;
  highlightedTerm: string;
  messageSuffix: string;
  primaryAction: string;
  secondaryAction: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface CareerSnapshot {
  career: string;
  annualSalaryUsd: string;
  demandLevel: string;
  marketGrowth: string;
  learningRoute: string;
  profileFit: string;
}

export interface DashboardViewModel {
  brand: string;
  navItems: ReadonlyArray<NavItem>;
  hero: HeroContent;
  featureCards: ReadonlyArray<FeatureCard>;
  progress: ProgressCard;
  mentor: MentorSuggestion;
  footerLinks: ReadonlyArray<FooterLink>;
}
