import { DashboardViewModel } from '../../../shared/interfaces/dashboard.interface';
import { FOOTER_LINKS_MOCK } from './footer.mock';
import { HERO_CONTENT_MOCK } from './hero.mock';
import { FEATURE_CARDS_MOCK, PROGRESS_CARD_MOCK } from './highlights.mock';
import { MENTOR_SUGGESTION_MOCK } from './mentor.mock';
import { BRAND_MOCK, NAV_ITEMS_MOCK } from './navigation.mock';

export const DASHBOARD_MODEL_MOCK: DashboardViewModel = {
  brand: BRAND_MOCK,
  navItems: NAV_ITEMS_MOCK,
  hero: HERO_CONTENT_MOCK,
  featureCards: FEATURE_CARDS_MOCK,
  progress: PROGRESS_CARD_MOCK,
  mentor: MENTOR_SUGGESTION_MOCK,
  footerLinks: FOOTER_LINKS_MOCK,
};
