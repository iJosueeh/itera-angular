export interface NavItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
  fragment?: string;
}

/** Shared sidebar items for all dashboard pages — single source of truth */
export const DASHBOARD_SIDEBAR_ITEMS: ReadonlyArray<NavItem> = [
  { label: 'Panel', href: '/dashboard', icon: 'bi-grid-1x2' },
  { label: 'Comparación', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
  { label: 'Progreso', href: '/dashboard/progress', icon: 'bi-graph-up-arrow' },
  { label: 'Mi Perfil', href: '/dashboard/profile', icon: 'bi-person' },
];

/** Shared top nav items for all dashboard pages */
export const DASHBOARD_TOP_NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: 'Panel', href: '/dashboard', icon: 'bi-grid-1x2' },
  { label: 'Comparación', href: '/dashboard/comparison', icon: 'bi-arrow-left-right' },
  { label: 'Progreso', href: '/dashboard/progress', icon: 'bi-graph-up-arrow' },
];

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
  growthYoY: string;
  demandLevel: string;
  demandMomentum: string;
  profileFit: string;
  alignmentDescription: string;
}

export interface CareerSearchMatch {
  category: string;
  /** career metrics if available in DB */
  metrics?: {
    annualSalaryUsd?: { min: number; max: number; promedio: number };
    demandVolume?: number;
    demandTrend?: string;
    topSkills?: string[];
  };
}

export interface CareerSearchResult {
  /** Original search keyword */
  query: string;
  /** All matching career categories */
  matches: CareerSearchMatch[];
  /** The currently selected career snapshot (or first match) */
  snapshot: CareerSnapshot | null;
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
