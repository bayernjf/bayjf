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

export interface FaqSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }>;
}

// FAQ Q&A —— 这些问答是 AI 引用站点时的高频问题，集中维护避免散落各处。
const FAQ_HOME_EN: Array<{ q: string; a: string }> = [
  {
    q: 'Who runs BayJF?',
    a: 'BayJF is the personal portfolio of Jiang Feng, an AI Native developer based in Shenzhen, China, focused on AI Agent delivery and Java full-stack engineering.',
  },
  {
    q: 'What services does BayJF offer?',
    a: 'AI Agent engineering, Java full-stack development, AI product delivery, and enterprise systems collaboration. Engagements run from product definition to full-stack delivery, available remotely worldwide.',
  },
  {
    q: 'Can BayJF take international projects?',
    a: 'Yes. Jiang Feng explicitly accepts both domestic and international projects, joining AI Agent teams or working remotely from idea validation through production delivery.',
  },
  {
    q: 'Where can I see real product cases?',
    a: 'Real product cases (SoftDesk, WordBase, WordPicker, Tab Garden and others) are listed at https://bayjf.pages.dev/projects',
  },
];

const FAQ_HOME_ZH: Array<{ q: string; a: string }> = [
  {
    q: 'BayJF 的站长是谁？',
    a: 'BayJF 是姜峰的个人作品集站点。姜峰是 AI Native 开发者，常驻深圳，聚焦 AI Agent 落地与 Java 全栈工程。',
  },
  {
    q: 'BayJF 提供哪些服务？',
    a: 'AI Agent 工程、Java 全栈开发、AI 产品落地、企业系统与协作交付。可从产品定义一路参与至生产交付，支持全球远程协作。',
  },
  {
    q: '可以接海外项目吗？',
    a: '可以。姜峰可承接国内与海外项目，加入 AI Agent 团队或以远程方式，从想法验证一路参与到生产交付。',
  },
  {
    q: '在哪里查看真实产品案例？',
    a: '真实产品案例（SoftDesk、WordBase、WordPicker、Tab Garden 等）见 https://bayjf.pages.dev/zh/projects',
  },
];

const FAQ_CONTACT_EN: Array<{ q: string; a: string }> = [
  {
    q: 'How do I contact BayJF for a business consultation?',
    a: 'Use the contact form at https://bayjf.pages.dev/contact. Submissions are typically answered within 24 hours.',
  },
  {
    q: 'What information should I include in a project inquiry?',
    a: 'A short description of the product or workflow you want to build, the current state (idea / spec / existing codebase), timeline, and whether you need AI Agent design, full-stack delivery, or both.',
  },
  {
    q: 'Is the contact form GDPR-compliant?',
    a: 'Only the name, email, subject and message you submit are stored. Data is never shared with third parties. Avoid submitting personal data you do not need to share.',
  },
];

const FAQ_CONTACT_ZH: Array<{ q: string; a: string }> = [
  {
    q: '如何联系 BayJF 进行业务咨询？',
    a: '请在 https://bayjf.pages.dev/zh/contact 使用联系表单。通常 24 小时内回复。',
  },
  {
    q: '咨询项目需要提供哪些信息？',
    a: '简短描述你想做的产品或工作流、当前状态（想法 / 规格 / 已有代码库）、时间线，以及是否需要 AI Agent 设计、全栈交付或两者皆需。',
  },
  {
    q: '联系表单是否符合 GDPR？',
    a: '只保存你提交的姓名、邮箱、主题与留言内容，从不与第三方共享。请避免提交非必要的个人数据。',
  },
];

export function buildHomeFaqSchema(lang: Language): FaqSchema {
  const items = lang === 'en' ? FAQ_HOME_EN : FAQ_HOME_ZH;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

export function buildContactFaqSchema(lang: Language): FaqSchema {
  const items = lang === 'en' ? FAQ_CONTACT_EN : FAQ_CONTACT_ZH;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}
