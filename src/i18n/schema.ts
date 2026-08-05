/**
 * Schema.org JSON-LD builders for BayJF.
 *
 * All structures are intentionally pure-data so they can be serialised with
 * JSON.stringify in BaseLayout.astro and emitted as <script type="application/ld+json">.
 *
 * GEO note: keeping these structures explicit and stable helps generative
 * engines (ChatGPT, Claude, Perplexity, Gemini) reliably attribute content
 * to the site owner. Do not inline random extra fields.
 */

import type { Language } from './translations';
import type { ScreenKey } from './routing';
import { translate, SEO_KEYS } from './translations';
import { baseForLang } from './routing';

export const SITE_URL = 'https://bayjf.pages.dev';
export const OWNER_NAME = 'Jiang Feng (BayJF)';
export const OWNER_GIVEN_NAME = 'Jiang';
export const OWNER_FAMILY_NAME = 'Feng';
export const OWNER_JOB_TITLE_EN = 'AI Native Developer & AI Agent Delivery';
export const OWNER_JOB_TITLE_ZH = 'AI Native 开发者 · AI Agent 落地';
export const OWNER_LOCATION_EN = 'Shenzhen, China · Remote / Global';
export const OWNER_LOCATION_ZH = '深圳 · 远程 / 全球协作';
export const OWNER_EMAIL = 'hello@bayjf.pages.dev';
// sameAs 链接：让 AI 引擎交叉验证作者身份。仅放真实公开身份。
export const OWNER_SAME_AS: string[] = [
  'https://github.com/bayernjf',
  'https://bayjf.pages.dev',
];

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  '@id': string;
  url: string;
  name: string;
  description: string;
  inLanguage: string;
  publisher: { '@id': string };
  potentialAction: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  '@id': string;
  name: string;
  givenName: string;
  familyName: string;
  jobTitle: string;
  description: string;
  url: string;
  image: string;
  email: string;
  address: {
    '@type': 'PostalAddress';
    addressLocality: string;
    addressCountry: string;
  };
  sameAs: string[];
  knowsAbout: string[];
  knowsLanguage: string[];
  worksFor: { '@type': 'Organization'; name: string } | undefined;
  alumniOf: { '@type': 'CollegeOrUniversity'; name: string } | undefined;
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

const SCREEN_LABEL_EN: Record<ScreenKey, string> = {
  home: 'Home',
  bayjf: 'Projects',
  experience: 'Experience',
  contact: 'Contact',
};

const SCREEN_LABEL_ZH: Record<ScreenKey, string> = {
  home: '首页',
  bayjf: '案例',
  experience: '履历',
  contact: '联系',
};

function screenPath(lang: Language, screen: ScreenKey): string {
  const base = baseForLang(lang);
  if (screen === 'home') return base || '/';
  const sub = screen === 'bayjf' ? 'projects' : screen;
  return `${base}/${sub}`;
}

function fullUrl(lang: Language, screen: ScreenKey): string {
  return `${SITE_URL}${screenPath(lang, screen)}`;
}

export function buildWebSiteSchema(lang: Language): WebSiteSchema {
  const desc = translate(lang, SEO_KEYS.home.desc);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'BayJF',
    description: desc,
    inLanguage: lang === 'en' ? 'en-US' : 'zh-CN',
    publisher: { '@id': `${SITE_URL}/#person` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildPersonSchema(lang: Language): PersonSchema {
  const desc = translate(lang, SEO_KEYS.home.desc);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: OWNER_NAME,
    givenName: OWNER_GIVEN_NAME,
    familyName: OWNER_FAMILY_NAME,
    jobTitle: lang === 'en' ? OWNER_JOB_TITLE_EN : OWNER_JOB_TITLE_ZH,
    description: desc,
    url: SITE_URL,
    image: `${SITE_URL}/og.svg`,
    email: `mailto:${OWNER_EMAIL}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: lang === 'en' ? 'Shenzhen' : '深圳',
      addressCountry: 'CN',
    },
    sameAs: OWNER_SAME_AS,
    knowsAbout: [
      'AI Agent engineering',
      'AI Native development',
      'Java enterprise full-stack',
      'LLM tool use and context design',
      'Workflow automation',
      'Product delivery',
    ],
    knowsLanguage: ['zh-CN', 'en-US'],
    worksFor: undefined,
    alumniOf: undefined,
  };
}

export function buildBreadcrumbSchema(
  lang: Language,
  screen: ScreenKey,
): BreadcrumbSchema {
  const labelMap = lang === 'en' ? SCREEN_LABEL_EN : SCREEN_LABEL_ZH;
  const items: BreadcrumbSchema['itemListElement'] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: labelMap.home,
      item: fullUrl(lang, 'home'),
    },
  ];
  if (screen !== 'home') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: labelMap[screen],
      item: fullUrl(lang, screen),
    });
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
