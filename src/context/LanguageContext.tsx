/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import { Project, ExperienceItem } from '../types';
import { TRANSLATIONS, type Language } from '../i18n/translations';

export type { Language };

const SOFT_DESK_RELEASE_DATE = '2026-06-22';
const WORD_BASE_RELEASE_DATE = '2026-06-02';
const TAB_GARDEN_RELEASE_DATE = '2026-07-19';
// 以下 11 个产品落地页统一于 2026-08-05 上线
const LANDING_BATCH_DATE = '2026-08-05';

export const PROJECTS_EN: Project[] = [
  {
    id: 'soft-desk',
    title: 'SoftDesk',
    category: 'DESKTOP SOFTWARE TOOL',
    description: 'An Electron desktop application for organizing software, workflows, favorites, shares, and usage insights, with a companion web experience.',
    image: 'https://soft-desk-landing.pages.dev/preview-en.png',
    tags: ['Electron', 'React', 'TypeScript', 'SQLite', 'Supabase'],
    link: 'https://soft-desk-landing.pages.dev/',
    date: SOFT_DESK_RELEASE_DATE
  },
  {
    id: 'word-base',
    title: 'WordBase Ecosystem',
    category: 'LANGUAGE LEARNING PLATFORM',
    description: 'A contextual vocabulary-learning workspace spanning web, desktop, and mobile, paired with WordPicker for browser-based lookup and word collection.',
    image: 'https://word-base.pages.dev/preview-en.png',
    tags: ['Next.js', 'React Native', 'Tauri', 'Hono', 'Supabase'],
    link: 'https://word-base.pages.dev/',
    date: WORD_BASE_RELEASE_DATE
  },
  {
    id: 'tab-garden',
    title: 'Tab Garden',
    category: 'BROWSER PRODUCTIVITY EXTENSION',
    description: 'A Chrome and Edge Manifest V3 extension that groups tabs by hostname, preserves user-created groups, and syncs grouping preferences after sign-in.',
    image: 'https://tab-manager-landing.pages.dev/preview-en.png',
    tags: ['Chrome Extension', 'TypeScript', 'Manifest V3', 'Supabase'],
    link: 'https://tab-manager-landing.pages.dev/',
    date: TAB_GARDEN_RELEASE_DATE
  },
  {
    id: 'agent-dev',
    title: 'Agent-Dev',
    category: 'AGENTIC PRODUCT DELIVERY PLATFORM',
    description: 'An agentic product delivery platform for turning AI Agent ideas into shipped products, orchestrating agents, tools, and human review across the delivery pipeline.',
    image: 'https://agent-dev-landing.pages.dev/preview-en.png',
    tags: ['AI Agent', 'Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://agent-dev-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'know-collect',
    title: 'VideoVault',
    category: 'CROSS-PLATFORM VIDEO BOOKMARK MANAGER',
    description: 'A cross-platform video bookmark manager that collects and organizes videos from Douyin, Bilibili, and Xiaohongshu into a single searchable library.',
    image: 'https://know-collect-landing.pages.dev/preview-en.png',
    tags: ['Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://know-collect-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'one-code',
    title: 'AI Watchdog',
    category: 'AI CODING MONITOR · VS CODE EXTENSION',
    description: 'A VS Code extension that monitors AI coding agents (Copilot Chat, Cline, terminal) in real time and notifies you via sound and desktop notifications when the AI finishes or needs a takeover.',
    image: 'https://one-code-landing.pages.dev/preview-en.png',
    tags: ['VS Code Extension', 'TypeScript', 'Astro', 'Tailwind CSS'],
    link: 'https://one-code-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'one-world',
    title: 'One World',
    category: '2D LIFE GAMIFICATION ENGINE',
    description: 'A 2D top-down life gamification engine that turns daily routines and goals into a playable, progressing world.',
    image: 'https://one-world-landing.pages.dev/preview-en.png',
    tags: ['Game', 'Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://one-world-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'pr-helper',
    title: 'PR Helper',
    category: 'GITHUB PR & RELEASE CONTROL TOWER',
    description: 'A GitHub-first control tower for pull requests and releases, consolidating review, merge, and release workflows into one dashboard.',
    image: 'https://pr-helper-landing.pages.dev/preview-en.png',
    tags: ['GitHub', 'Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://pr-helper-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'shareit',
    title: 'ShareIt',
    category: 'PRIVACY-FIRST FAMILY MEDIA SHARING',
    description: 'A privacy-first family photo and video sharing app that keeps your media under your control while making sharing effortless.',
    image: 'https://shareit-landing.pages.dev/preview-en.png',
    tags: ['Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://shareit-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'splity',
    title: 'Splity',
    category: 'KNOWLEDGE-TO-FLASHCARD SPLITTER',
    description: 'A knowledge-to-flashcard tool that splits pasted text into front/back flip cards, supporting 6 formats. No registration, data stays in the browser.',
    image: 'https://splity-landing.pages.dev/preview-en.png',
    tags: ['Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://splity-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'termana',
    title: 'Termana',
    category: 'TERMINAL PROJECT LAUNCHER FOR CODING AGENTS',
    description: 'A local-first terminal project launcher. Manage multiple projects in one panel, bind a coding agent (Claude Code, Codex, Aider, OpenCode) to each, and launch with one click. Built-in AGENTS.md context editor.',
    image: 'https://termana-landing.pages.dev/preview-en.png',
    tags: ['Tauri', 'Rust', 'TypeScript', 'macOS', 'Windows'],
    link: 'https://termana-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'toclick',
    title: 'FlagBreaker',
    category: 'AI-POWERED SELF-DISCIPLINE APP',
    description: 'An AI-persona-powered self-discipline app that supervises your habits and goals through character-driven accountability.',
    image: 'https://toclick-landing.pages.dev/preview-en.png',
    tags: ['AI', 'Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://toclick-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'vfx-todo',
    title: 'VFX Todo',
    category: 'DESKTOP TODO APP WITH VISUAL EFFECTS',
    description: 'A Tauri-based desktop todo app that triggers 8 WebGL visual effects (bullet comments, particles, fireworks, etc.) when you complete a task. Lightweight, native, cross-platform.',
    image: 'https://vfx-todo-landing.pages.dev/preview-en.png',
    tags: ['Tauri', 'Rust', 'TypeScript', 'WebGL'],
    link: 'https://vfx-todo-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'word-picker',
    title: 'WordPicker',
    category: 'BROWSER VOCABULARY LOOKUP EXTENSION',
    description: 'A browser extension for in-page word lookup and vocabulary collection, designed to work with the WordBase ecosystem.',
    image: 'https://word-picker-landing.pages.dev/preview-en.png',
    tags: ['Chrome Extension', 'TypeScript', 'Astro', 'Tailwind CSS'],
    link: 'https://word-picker-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  }
];

export const PROJECTS_ZH: Project[] = [
  {
    id: 'soft-desk',
    title: 'SoftDesk',
    category: '桌面软件管理工具',
    description: '基于 Electron 的桌面应用，用于管理软件、工作流、收藏、分享与使用统计，并配有对应的 Web 体验。',
    image: 'https://soft-desk-landing.pages.dev/preview-zh.png',
    tags: ['Electron', 'React', 'TypeScript', 'SQLite', 'Supabase'],
    link: 'https://soft-desk-landing.pages.dev/',
    date: SOFT_DESK_RELEASE_DATE
  },
  {
    id: 'word-base',
    title: 'WordBase 生态',
    category: '语言学习平台',
    description: '覆盖 Web、桌面端与移动端的语境化词汇学习工作台；搭配 WordPicker 浏览器扩展，完成浏览器查词与单词沉淀。',
    image: 'https://word-base.pages.dev/preview-zh.png',
    tags: ['Next.js', 'React Native', 'Tauri', 'Hono', 'Supabase'],
    link: 'https://word-base.pages.dev/',
    date: WORD_BASE_RELEASE_DATE
  },
  {
    id: 'tab-garden',
    title: 'Tab Garden',
    category: '浏览器效率扩展',
    description: '面向 Chrome 与 Edge 的 Manifest V3 扩展，按站点自动分组标签页、保留用户自定义分组，并在登录后同步分组偏好。',
    image: 'https://tab-manager-landing.pages.dev/preview-zh.png',
    tags: ['Chrome 扩展', 'TypeScript', 'Manifest V3', 'Supabase'],
    link: 'https://tab-manager-landing.pages.dev/',
    date: TAB_GARDEN_RELEASE_DATE
  },
  {
    id: 'agent-dev',
    title: 'Agent-Dev',
    category: '智能体产品交付平台',
    description: '智能体产品交付平台，把 AI Agent 想法变成可交付产品，在交付链路上编排智能体、工具与人工审核。',
    image: 'https://agent-dev-landing.pages.dev/preview-zh.png',
    tags: ['AI Agent', 'Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://agent-dev-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'know-collect',
    title: 'VideoVault',
    category: '跨平台视频书签管理器',
    description: '跨平台视频书签管理器，将抖音、B 站、小红书的视频统一收藏并整理为可搜索的资料库。',
    image: 'https://know-collect-landing.pages.dev/preview-zh.png',
    tags: ['Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://know-collect-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'one-code',
    title: 'AI Watchdog',
    category: 'AI 编码监控 · VS Code 扩展',
    description: 'VS Code 扩展，实时监控 Copilot Chat、Cline、终端等 AI 编码工具；当 AI 完成任务或需要接管时，立即通过声音和桌面通知提醒你。',
    image: 'https://one-code-landing.pages.dev/preview-zh.png',
    tags: ['VS Code 扩展', 'TypeScript', 'Astro', 'Tailwind CSS'],
    link: 'https://one-code-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'one-world',
    title: 'One World',
    category: '2D 生活游戏化引擎',
    description: '2D 俯视角生活游戏化引擎，把日常习惯与目标转化为可游玩、可成长的世界。',
    image: 'https://one-world-landing.pages.dev/preview-zh.png',
    tags: ['Game', 'Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://one-world-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'pr-helper',
    title: 'PR Helper',
    category: 'GitHub PR 与发布控制塔',
    description: 'GitHub 优先的 PR 与发布控制塔，将评审、合并与发布流程整合到一个看板。',
    image: 'https://pr-helper-landing.pages.dev/preview-zh.png',
    tags: ['GitHub', 'Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://pr-helper-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'shareit',
    title: 'ShareIt',
    category: '隐私优先的家庭媒体分享',
    description: '隐私优先的家庭照片与视频分享应用，媒体由你掌控，分享依然轻松。',
    image: 'https://shareit-landing.pages.dev/preview-zh.png',
    tags: ['Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://shareit-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'splity',
    title: 'Splity',
    category: '知识点学习卡片分割工具',
    description: '粘贴一段文本，自动识别 6 种格式并拆分为正反面翻转卡片。无需注册，数据留在浏览器，开箱即用。',
    image: 'https://splity-landing.pages.dev/preview-zh.png',
    tags: ['Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://splity-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'termana',
    title: 'Termana',
    category: '面向 Coding Agent 的终端项目启动器',
    description: '本地优先的终端项目启动器。在一个面板里管理多个项目，为每个项目绑定一个 coding agent（Claude Code、Codex、Aider、OpenCode），点一下即可启动。内置 AGENTS.md 上下文编辑器。',
    image: 'https://termana-landing.pages.dev/preview-zh.png',
    tags: ['Tauri', 'Rust', 'TypeScript', 'macOS', 'Windows'],
    link: 'https://termana-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'toclick',
    title: '反旗 FlagBreaker',
    category: 'AI 人设化监督自律应用',
    description: 'AI 人设化监督自律 App，通过角色驱动的问责机制监督你的习惯与目标。',
    image: 'https://toclick-landing.pages.dev/preview-zh.png',
    tags: ['AI', 'Astro', 'TypeScript', 'Tailwind CSS'],
    link: 'https://toclick-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'vfx-todo',
    title: 'VFX Todo',
    category: '带特效的桌面待办应用',
    description: '基于 Tauri 的桌面待办应用，完成任务时触发 8 种 WebGL 视觉特效（弹幕、粒子、烟花等）。轻量、原生、跨平台。',
    image: 'https://vfx-todo-landing.pages.dev/preview-zh.png',
    tags: ['Tauri', 'Rust', 'TypeScript', 'WebGL'],
    link: 'https://vfx-todo-landing.pages.dev/',
    date: LANDING_BATCH_DATE
  },
  {
    id: 'word-picker',
    title: 'WordPicker',
    category: '浏览器查词扩展',
    description: '浏览器扩展，支持页内查词与单词收藏，与 WordBase 生态配合使用。',
    image: 'https://word-picker-landing.pages.dev/preview-zh.png',
    tags: ['Chrome 扩展', 'TypeScript', 'Astro', 'Tailwind CSS'],
    link: 'https://word-picker-landing.pages.dev/',
    date: LANDING_BATCH_DATE
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
