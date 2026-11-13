import * as englishPortfolio from '../data/portfolio';
import * as polishPortfolio from '../data/pl/portfolio';
import { experience as englishExperience } from '../data/experience';
import { experience as polishExperience } from '../data/pl/experience';
import { localeOf, ui } from './ui';

/** Build-time content selection; full copy is never shipped to the browser. */
export function contentFor(currentLocale: string | undefined) {
  const locale = localeOf(currentLocale);
  const portfolio = locale === 'pl' ? polishPortfolio : englishPortfolio;
  return {
    locale,
    t: ui[locale],
    profile: portfolio.profile,
    projects: portfolio.projects,
    heroHeadlines: portfolio.heroHeadlines,
    experience: locale === 'pl' ? polishExperience : englishExperience,
  };
}
