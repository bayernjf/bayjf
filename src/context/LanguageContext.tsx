/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ExperienceItem } from '../types';
import { TRANSLATIONS, type Language } from '../i18n/translations';

export type { Language };

const SOFT_DESK_RELEASE_DATE = '2026-06-22';
const WORD_BASE_RELEASE_DATE = '2026-06-02';
const TAB_GARDEN_RELEASE_DATE = '2026-07-19';

const PROJECTS_EN: Project[] = [
  {
    id: 'soft-desk',
    title: 'SoftDesk',
    category: 'DESKTOP SOFTWARE TOOL',
    description: 'An Electron desktop application for organizing software, workflows, favorites, shares, and usage insights, with a companion web experience.',
    image: 'https://soft-desk-landing.pages.dev/preview.png',
    tags: ['Electron', 'React', 'TypeScript', 'SQLite', 'Supabase'],
    link: 'https://soft-desk-landing.pages.dev/',
    date: SOFT_DESK_RELEASE_DATE
  },
  {
    id: 'word-base',
    title: 'WordBase Ecosystem',
    category: 'LANGUAGE LEARNING PLATFORM',
    description: 'A contextual vocabulary-learning workspace spanning web, desktop, and mobile, paired with WordPicker for browser-based lookup and word collection.',
    image: 'https://word-base.pages.dev/preview.png',
    tags: ['Next.js', 'React Native', 'Tauri', 'Hono', 'Supabase'],
    link: 'https://word-base.pages.dev/',
    date: WORD_BASE_RELEASE_DATE
  },
  {
    id: 'tab-garden',
    title: 'Tab Garden',
    category: 'BROWSER PRODUCTIVITY EXTENSION',
    description: 'A Chrome and Edge Manifest V3 extension that groups tabs by hostname, preserves user-created groups, and syncs grouping preferences after sign-in.',
    image: 'https://opengraph.githubassets.com/1/bayernjf/tab-manager',
    tags: ['Chrome Extension', 'TypeScript', 'Manifest V3', 'Supabase'],
    link: 'https://github.com/bayernjf/tab-manager',
    date: TAB_GARDEN_RELEASE_DATE
  }
];

const PROJECTS_ZH: Project[] = [
  {
    id: 'soft-desk',
    title: 'SoftDesk',
    category: '桌面软件管理工具',
    description: '基于 Electron 的桌面应用，用于管理软件、工作流、收藏、分享与使用统计，并配有对应的 Web 体验。',
    image: 'https://soft-desk-landing.pages.dev/preview.png',
    tags: ['Electron', 'React', 'TypeScript', 'SQLite', 'Supabase'],
    link: 'https://soft-desk-landing.pages.dev/',
    date: SOFT_DESK_RELEASE_DATE
  },
  {
    id: 'word-base',
    title: 'WordBase 生态',
    category: '语言学习平台',
    description: '覆盖 Web、桌面端与移动端的语境化词汇学习工作台；搭配 WordPicker 浏览器扩展，完成浏览器查词与单词沉淀。',
    image: 'https://word-base.pages.dev/preview.png',
    tags: ['Next.js', 'React Native', 'Tauri', 'Hono', 'Supabase'],
    link: 'https://word-base.pages.dev/',
    date: WORD_BASE_RELEASE_DATE
  },
  {
    id: 'tab-garden',
    title: 'Tab Garden',
    category: '浏览器效率扩展',
    description: '面向 Chrome 与 Edge 的 Manifest V3 扩展，按站点自动分组标签页、保留用户自定义分组，并在登录后同步分组偏好。',
    image: 'https://opengraph.githubassets.com/1/bayernjf/tab-manager',
    tags: ['Chrome 扩展', 'TypeScript', 'Manifest V3', 'Supabase'],
    link: 'https://github.com/bayernjf/tab-manager',
    date: TAB_GARDEN_RELEASE_DATE
  }
];

const EXPERIENCE_EN: ExperienceItem[] = [
  {
    id: 'ai-native',
    role: 'AI Native Full-stack Developer',
    company: 'Independent Practice',
    companyDescription: 'Helping teams and individuals turn AI Agent ideas into practical products, workflows, and efficiency gains.',
    location: 'Shanghai / Shenzhen · Remote / Global',
    period: '2026.01 - Present',
    bullets: [
      'Design and deliver AI Agent solutions for business and personal productivity.',
      'Take projects from product definition to full-stack implementation.',
      'Available for China and international projects, remote roles, and AI transformation engagements.'
    ]
  }
  ,{
    id: 'soft-power', role: 'Java Engineer / AI Developer', company: 'Shenzhen Soft Power Technology',
    companyDescription: 'Enterprise software development and DevOps platform delivery.', location: 'Shenzhen', period: '2025.01 - 2025.12',
    bullets: ['Developed and optimized internal DevOps platform modules, including AI summaries and analysis workflows.', 'Designed APIs, implemented features, and collaborated on testing and documentation.']
  },
  {
    id: 'hengge', role: 'Java Engineer', company: 'Shanghai Hengge Information Technology',
    companyDescription: 'Enterprise system development for insurance and consumer rights workflows.', location: 'Shenzhen', period: '2024.06 - 2024.12',
    bullets: ['Delivered business modules, dashboards, workflow coordination, permissions, and query optimizations.', 'Supported maintenance, testing, and iterative feature delivery.']
  },
  {
    id: 'changliang', role: 'Java Engineer', company: 'Beijing Changan Hedo Information Technology',
    companyDescription: 'Budget management system development for a rural commercial bank.', location: 'Remote', period: '2021.03 - 2022.08',
    bullets: ['Contributed to budget planning, reporting, permissions, data processing, and system maintenance.', 'Supported project acceptance and coordinated delivery with business and engineering teams.']
  }
];

const EXPERIENCE_ZH: ExperienceItem[] = [
  {
    id: 'ai-native',
    role: 'AI Native 全栈开发者',
    company: '独立实践',
    companyDescription: '帮助企业与个人将 AI Agent 想法落地为可用产品、工作流与效率提升方案。',
    location: '上海 / 深圳 · 支持远程与全球协作',
    period: '2026.01 - 至今',
    bullets: [
      '为企业和个人设计、开发可落地的 AI Agent，提升工作与业务效率。',
      '可从产品定义到全栈实现，交付可持续迭代的应用与自动化工作流。',
      '可承接国内和海外项目，也可入职从事 AI Agent 或远程工作。'
    ]
  }
  ,{
    id: 'soft-power', role: 'Java 工程师/AI开发', company: '深圳软通动力信息科技有限公司', companyDescription: '企业软件开发与 DevOps 平台交付。', location: '深圳', period: '2025.01 - 2025.12',
    bullets: ['负责 DevOps 平台模块开发与优化，涉及 AI 总结、AI 分析、通知与流程协作。', '完成需求分析、接口设计、编码自测，并配合测试和文档交付。']
  },
  {
    id: 'hengge', role: 'Java 工程师', company: '上海恒格信息科技有限公司', companyDescription: '保险与消费者权益业务系统开发。', location: '深圳', period: '2024.06 - 2024.12',
    bullets: ['负责业务模块、数据看板、流程协同、权限控制与查询优化。', '参与系统维护、测试和持续功能迭代。']
  },
  {
    id: 'changliang', role: 'Java 工程师', company: '北京长亮合度信息技术有限公司', companyDescription: '农商行全面预算管理系统开发。', location: '苏州', period: '2021.03 - 2022.08',
    bullets: ['参与预算编制、报表、权限、数据加工和系统维护功能。', '参与项目验收，并协助业务与研发团队完成交付。']
  }
];

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, any>) => string;
  projects: Project[];
  experienceItems: ExperienceItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (initialLanguage === 'en' || initialLanguage === 'zh') return initialLanguage;
    try {
      const saved = localStorage.getItem('bayjf_lang');
      if (saved === 'en' || saved === 'zh') {
        return saved;
      }
    } catch (e) {
      // Ignore localStorage issues
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('bayjf_lang', lang);
    } catch (e) {
      // Ignore localStorage issues
    }
  };

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bayjf_sound');
      return saved === null ? true : saved === 'true';
    } catch (e) {
      return true;
    }
  });

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem('bayjf_sound', String(enabled));
    } catch (e) {}
  };

  const [searchQuery, setSearchQuery] = useState('');

  const t = (key: string, variables?: Record<string, any>): string => {
    const dictionary = TRANSLATIONS[language];
    let template = dictionary[key] || TRANSLATIONS['en'][key] || key;

    if (variables) {
      Object.entries(variables).forEach(([name, val]) => {
        template = template.replace(`{${name}}`, String(val));
      });
    }

    return template;
  };

  const projects = language === 'en' ? PROJECTS_EN : PROJECTS_ZH;
  const experienceItems = language === 'en' ? EXPERIENCE_EN : EXPERIENCE_ZH;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, projects, experienceItems, searchQuery, setSearchQuery, soundEnabled, setSoundEnabled }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
