/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ExperienceItem } from '../types';

export type Language = 'en' | 'zh';

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

const PROJECTS_EN: Project[] = [
  {
    id: 'soft-desk',
    title: 'SoftDesk',
    category: 'DESKTOP SOFTWARE TOOL',
    description: 'An Electron desktop application for organizing software, workflows, favorites, shares, and usage insights, with a companion web experience.',
    image: 'https://opengraph.githubassets.com/1/bayernjf/soft-desk',
    tags: ['Electron', 'React', 'TypeScript', 'SQLite', 'Supabase'],
    link: 'https://soft-desk-landing.pages.dev/'
  },
  {
    id: 'word-base',
    title: 'WordBase Ecosystem',
    category: 'LANGUAGE LEARNING PLATFORM',
    description: 'A contextual vocabulary-learning workspace spanning web, desktop, and mobile, paired with WordPicker for browser-based lookup and word collection.',
    image: 'https://opengraph.githubassets.com/1/bayernjf/word-base',
    tags: ['Next.js', 'React Native', 'Tauri', 'Hono', 'Supabase'],
    link: 'https://word-base.pages.dev/'
  },
  {
    id: 'tab-garden',
    title: 'Tab Garden',
    category: 'BROWSER PRODUCTIVITY EXTENSION',
    description: 'A Chrome and Edge Manifest V3 extension that groups tabs by hostname, preserves user-created groups, and syncs grouping preferences after sign-in.',
    image: 'https://opengraph.githubassets.com/1/bayernjf/tab-manager',
    tags: ['Chrome Extension', 'TypeScript', 'Manifest V3', 'Supabase'],
    link: 'https://github.com/bayernjf/tab-manager'
  }
];

const PROJECTS_ZH: Project[] = [
  {
    id: 'soft-desk',
    title: 'SoftDesk',
    category: '桌面软件管理工具',
    description: '基于 Electron 的桌面应用，用于管理软件、工作流、收藏、分享与使用统计，并配有对应的 Web 体验。',
    image: 'https://opengraph.githubassets.com/1/bayernjf/soft-desk',
    tags: ['Electron', 'React', 'TypeScript', 'SQLite', 'Supabase'],
    link: 'https://soft-desk-landing.pages.dev/'
  },
  {
    id: 'word-base',
    title: 'WordBase 生态',
    category: '语言学习平台',
    description: '覆盖 Web、桌面端与移动端的语境化词汇学习工作台；搭配 WordPicker 浏览器扩展，完成浏览器查词与单词沉淀。',
    image: 'https://opengraph.githubassets.com/1/bayernjf/word-base',
    tags: ['Next.js', 'React Native', 'Tauri', 'Hono', 'Supabase'],
    link: 'https://word-base.pages.dev/'
  },
  {
    id: 'tab-garden',
    title: 'Tab Garden',
    category: '浏览器效率扩展',
    description: '面向 Chrome 与 Edge 的 Manifest V3 扩展，按站点自动分组标签页、保留用户自定义分组，并在登录后同步分组偏好。',
    image: 'https://opengraph.githubassets.com/1/bayernjf/tab-manager',
    tags: ['Chrome 扩展', 'TypeScript', 'Manifest V3', 'Supabase'],
    link: 'https://github.com/bayernjf/tab-manager'
  }
];

const EXPERIENCE_EN: ExperienceItem[] = [
  {
    id: 'ai-native',
    role: 'AI Native Full-stack Developer',
    company: 'Independent Practice',
    companyDescription: 'Helping teams and individuals turn AI Agent ideas into practical products, workflows, and efficiency gains.',
    location: 'Shenzhen · Remote / Global',
    period: 'Current',
    bullets: [
      'Design and deliver AI Agent solutions for business and personal productivity.',
      'Take projects from product definition to full-stack implementation.',
      'Available for China and international projects, remote roles, and AI transformation engagements.'
    ]
  }
  ,{
    id: 'soft-power', role: 'Java Engineer', company: 'Shenzhen Soft Power Technology',
    companyDescription: 'Enterprise software development and DevOps platform delivery.', location: 'Shenzhen', period: '2025 - Present',
    bullets: ['Developed and optimized internal DevOps platform modules, including AI summaries and analysis workflows.', 'Designed APIs, implemented features, and collaborated on testing and documentation.']
  },
  {
    id: 'hengge', role: 'Java Engineer', company: 'Shanghai Hengge Information Technology',
    companyDescription: 'Enterprise system development for insurance and consumer rights workflows.', location: 'Shenzhen', period: '2024 - 2024',
    bullets: ['Delivered business modules, dashboards, workflow coordination, permissions, and query optimizations.', 'Supported maintenance, testing, and iterative feature delivery.']
  },
  {
    id: 'changliang', role: 'Java Engineer', company: 'Beijing Changan Hedo Information Technology',
    companyDescription: 'Budget management system development for a rural commercial bank.', location: 'Remote', period: '2021 - 2022',
    bullets: ['Contributed to budget planning, reporting, permissions, data processing, and system maintenance.', 'Supported project acceptance and coordinated delivery with business and engineering teams.']
  }
];

const EXPERIENCE_ZH: ExperienceItem[] = [
  {
    id: 'ai-native',
    role: 'AI Native 全栈开发者',
    company: '独立实践',
    companyDescription: '帮助企业与个人将 AI Agent 想法落地为可用产品、工作流与效率提升方案。',
    location: '深圳 · 支持远程与全球协作',
    period: '当前',
    bullets: [
      '为企业和个人设计、开发可落地的 AI Agent，提升工作与业务效率。',
      '可从产品定义到全栈实现，交付可持续迭代的应用与自动化工作流。',
      '可承接国内和海外项目，也可入职从事 AI Agent 或远程工作。'
    ]
  }
  ,{
    id: 'soft-power', role: 'Java 工程师', company: '深圳软通动力信息科技有限公司', companyDescription: '企业软件开发与 DevOps 平台交付。', location: '深圳', period: '2025 - 至今',
    bullets: ['负责 DevOps 平台模块开发与优化，涉及 AI 总结、AI 分析、通知与流程协作。', '完成需求分析、接口设计、编码自测，并配合测试和文档交付。']
  },
  {
    id: 'hengge', role: 'Java 工程师', company: '上海恒格信息科技有限公司', companyDescription: '保险与消费者权益业务系统开发。', location: '深圳', period: '2024 - 2024',
    bullets: ['负责业务模块、数据看板、流程协同、权限控制与查询优化。', '参与系统维护、测试和持续功能迭代。']
  },
  {
    id: 'changliang', role: 'Java 工程师', company: '北京长亮合度信息技术有限公司', companyDescription: '农商行全面预算管理系统开发。', location: '苏州', period: '2021 - 2022',
    bullets: ['参与预算编制、报表、权限、数据加工和系统维护功能。', '参与项目验收，并协助业务与研发团队完成交付。']
  }
];

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // SEO & Meta
    'seo.home.title': 'AI Native Developer & AI Agent Builder | 姜峰',
    'seo.home.desc': 'AI Native full-stack developer helping businesses and individuals turn AI Agent ideas into practical products and workflows.',
    'seo.bayjf.title': 'Selected Projects | BayJF',
    'seo.bayjf.desc': 'Real products and tools built across AI-enabled workflows, enterprise systems, language learning, and browser productivity.',
    'seo.experience.title': 'Experience & Skills | BayJF',
    'seo.experience.desc': 'A chronological journey through my professional career, highlighting key roles, projects, and my core technical capabilities.',
    'seo.contact.title': "Let's Connect | BayJF",
    'seo.contact.desc': 'Get in touch for new opportunities, creative collaborations, or custom product design and engineering solutions.',

    // Header
    'nav.home': 'Home',
    'nav.bayjf': 'Projects',
    'nav.experience': 'Experience',
    'nav.contact': 'Contact',
    'nav.search': 'Search projects...',
    'nav.soundOn': 'Mute toggle sound',
    'nav.soundOff': 'Unmute toggle sound',
    
    // HomeScreen
    'home.hero.title1': 'AI Native',
    'home.hero.title2': 'AI Agent Delivery',
    'home.hero.subtitle': 'I help businesses and individuals turn AI Agent ideas into practical products, automated workflows, and measurable efficiency gains — from product definition to full-stack delivery.',
    'home.hero.btnWork': 'View Work',
    'home.hero.btnAbout': 'About Me',
    'home.hero.scroll': 'Scroll',
    'home.philosophy.title': 'Build the agent. Improve the work.',
    'home.philosophy.p1': 'I focus on turning complex work into clear, reliable systems. For AI Agent projects, that means understanding the real workflow first, then connecting models, tools, data, and human decisions into a product people can actually use.',
    'home.philosophy.p2': 'With over a decade of experience bridging the gap between design and engineering, I focus on creating systems that scale gracefully while maintaining a meticulous attention to detail at the micro-level.',
    'home.philosophy.yearsExp': 'AI Native Focus',
    'home.philosophy.projectsShipped': 'Real Product Cases',

    // BayjfScreen
    'bayjf.headerTag': 'My BayJF',
    'bayjf.title': 'Selected Projects',
    'bayjf.desc': 'A selection of real products and tools built for business efficiency, learning workflows, and everyday productivity.',
    'bayjf.filter': 'Filter:',
    'bayjf.viewCaseStudy': 'VIEW CASE STUDY',
    'bayjf.more': 'more',
    'bayjf.projectDetails': 'PROJECT DETAILS',
    'bayjf.overview': 'Overview',
    'bayjf.techUsed': 'Technologies Used',
    'bayjf.close': 'Close',
    'bayjf.externalLink': 'Visit Live Project',
    'bayjf.launchDemo': 'Launch Demo',

    // ExperienceScreen
    'experience.headerTag': 'My Path',
    'experience.title': 'Experience',
    'experience.desc': 'A chronological journey through my professional career, highlighting key roles, projects, and the impact delivered at each stage.',
    'experience.skillsHeaderTag': 'Skills & Proficiencies',
    'experience.skillsTitle': 'Technical Capabilities',
    'experience.skillsDesc': 'A practical overview of the engineering and AI Agent capabilities I use to turn ideas into working products.',
    'experience.skillsTech': 'Technologies & Frameworks',
    'experience.years': 'years',
    'experience.year': 'year',

    // SkillsGrid (Categories & Skills translation keys inside are loaded natively, but we can localize their title & description labels)
    'skills.ui-ux.title': 'AI Agent Engineering',
    'skills.ui-ux.desc': 'Designing agent workflows, tool use, context, and reliable human-in-the-loop experiences.',
    'skills.frontend.title': 'Java Full-stack Development',
    'skills.frontend.desc': 'Building maintainable enterprise applications from API and database design to web delivery.',
    'skills.creative.title': 'AI Product Delivery',
    'skills.creative.desc': 'Turning AI capabilities into practical products, automations, and measurable workflow improvements.',
    'skills.strategy.title': 'Enterprise Systems & Collaboration',
    'skills.strategy.desc': 'Understanding business processes, coordinating delivery, and improving systems through iterative development.',

    // ContactScreen
    'contact.headerTag': 'Contact',
    'contact.title': "Let's Connect",
    'contact.desc': 'Available for AI Agent delivery, full-stack development, enterprise efficiency projects, international collaboration, and remote roles.',
    'contact.info.location': 'Based In',
    'contact.info.locationVal': 'Shenzhen · Remote / Global',
    'contact.info.email': 'Direct Email',
    'contact.info.socials': 'Digital Spaces',
    'contact.form.successHeader': 'Message Sent',
    'contact.form.successSub': "Thank you for reaching out. I'll get back to you shortly, typically within 24 hours.",
    'contact.form.namePlaceholder': 'Your Name',
    'contact.form.emailPlaceholder': 'Email Address',
    'contact.form.subjectPlaceholder': 'Subject',
    'contact.form.messagePlaceholder': 'Tell me about your project...',
    'contact.form.sending': 'SENDING...',
    'contact.form.send': 'SEND MESSAGE',
    'contact.form.errName': 'Name is required',
    'contact.form.errEmailReq': 'Email address is required',
    'contact.form.errEmailInvalid': 'Please enter a valid email address',
    'contact.form.errSubject': 'Subject is required',
    'contact.form.errMessage': 'Message is required',

    // Footer
    'footer.copyright': '© {year} 姜峰 · AI Native Development. All rights reserved.',
  },
  zh: {
    // SEO & Meta
    'seo.home.title': 'AI Native 开发者与 AI Agent 落地 | 姜峰',
    'seo.home.desc': '欢迎来到数字化匠心与产品设计作品集。探索直观、优雅和高性能的数字产品与系统设计。',
    'seo.bayjf.title': '精选项目 | BayJF',
    'seo.bayjf.desc': '精心策划的产品、界面和视觉系统展厅，旨在将功能与数字化美学完美融合。',
    'seo.experience.title': '工作经历与技能 | 作品集',
    'seo.experience.desc': '我的职业生涯成长轨迹，重点展示关键角色、项目和核心技术能力。',
    'seo.contact.title': '取得联系 | BayJF',
    'seo.contact.desc': '期待与您就新机遇、创意合作或定制化产品设计与工程解决方案展开交流。',

    // Header
    'nav.home': '首页',
    'nav.bayjf': '案例',
    'nav.experience': '履历',
    'nav.contact': '联系',
    'nav.search': '搜索项目...',
    'nav.soundOn': '静音开关提示音',
    'nav.soundOff': '开启开关提示音',
    
    // HomeScreen
    'home.hero.title1': 'AI Native',
    'home.hero.title2': 'AI Agent 落地',
    'home.hero.subtitle': '帮助企业与个人将 AI Agent 想法变成可用产品、自动化工作流和真实效率提升，从产品定义到全栈交付。',
    'home.hero.btnWork': '精选作品',
    'home.hero.btnAbout': '关于我',
    'home.hero.scroll': '向下滑动',
    'home.philosophy.title': '让 Agent 真正改善工作',
    'home.philosophy.p1': '我关注的是如何把复杂工作变成清晰、可靠的系统。做 AI Agent 时，我会先理解真实业务流程，再把模型、工具、数据和人的判断连接起来，交付真正能被使用的产品。',
    'home.philosophy.p2': '我可以承接国内和海外项目，加入 AI Agent 团队，或以远程方式从想法验证一路参与到生产交付。',
    'home.philosophy.yearsExp': 'AI Native 方向',
    'home.philosophy.projectsShipped': '真实产品案例',

    // BayjfScreen
    'bayjf.headerTag': '我的作品集',
    'bayjf.title': '精选项目',
    'bayjf.desc': '精心策划的产品、界面和视觉系统画廊，致力于将核心功能与完美的像素打磨有机融合。',
    'bayjf.filter': '筛选:',
    'bayjf.viewCaseStudy': '查看案例研究',
    'bayjf.more': '更多',
    'bayjf.projectDetails': '项目详情',
    'bayjf.overview': '项目概述',
    'bayjf.techUsed': '所用技术',
    'bayjf.close': '关闭',
    'bayjf.externalLink': '访问线上项目',
    'bayjf.launchDemo': '启动演示',

    // ExperienceScreen
    'experience.headerTag': '成长轨迹',
    'experience.title': '工作经历',
    'experience.desc': '我的职业生涯轨迹，重点展示我在各个阶段承担的关键角色、主导项目以及交付的核心价值。',
    'experience.skillsHeaderTag': '专业技能',
    'experience.skillsTitle': '核心技术能力',
    'experience.skillsDesc': '我对创建数字化匠心产品所熟练掌握的工具、技术及方法论的视觉概览。',
    'experience.skillsTech': '技术与框架',
    'experience.years': '年',
    'experience.year': '年',

    // SkillsGrid
    'skills.ui-ux.title': 'AI Agent 工程',
    'skills.ui-ux.desc': '设计 Agent 工作流、工具调用、上下文管理与可靠的人机协作体验。',
    'skills.frontend.title': 'Java 全栈开发',
    'skills.frontend.desc': '从 API 与数据库设计到 Web 交付，构建可维护的企业级应用。',
    'skills.creative.title': 'AI 产品落地',
    'skills.creative.desc': '把 AI 能力转化为实用产品、自动化流程和可感知的工作效率提升。',
    'skills.strategy.title': '企业系统与协作交付',
    'skills.strategy.desc': '理解业务流程，协同团队交付，并通过持续开发改进系统。',

    // ContactScreen
    'contact.headerTag': '取得联系',
    'contact.title': '让我们开始沟通',
    'contact.desc': '我随时乐意与您探讨全新的设计挑战、空间界面体系、协同产品架构或数字化创新的可能。',
    'contact.info.location': '当前位于',
    'contact.info.locationVal': '深圳 · 远程 / 全球协作',
    'contact.info.email': '直连邮箱',
    'contact.info.socials': '社交空间',
    'contact.form.successHeader': '发送成功',
    'contact.form.successSub': '感谢您的联系。我会尽快给您回复，通常在 24 小时以内。',
    'contact.form.namePlaceholder': '您的姓名',
    'contact.form.emailPlaceholder': '电子邮箱',
    'contact.form.subjectPlaceholder': '主题',
    'contact.form.messagePlaceholder': '告诉我关于您的项目想法...',
    'contact.form.sending': '正在发送...',
    'contact.form.send': '发送留言',
    'contact.form.errName': '姓名不能为空',
    'contact.form.errEmailReq': '邮箱不能为空',
    'contact.form.errEmailInvalid': '请输入有效的邮箱地址',
    'contact.form.errSubject': '主题不能为空',
    'contact.form.errMessage': '留言内容不能为空',

    // Footer
    'footer.copyright': '© {year} 数字化匠心. 保留所有权利。',
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Try to load initial language from localStorage
  const [language, setLanguageState] = useState<Language>(() => {
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
