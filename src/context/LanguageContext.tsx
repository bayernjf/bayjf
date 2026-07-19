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
    id: 'lumina-pay',
    title: 'Lumina Pay',
    category: 'FINTECH PLATFORM',
    description: 'A streamlined payment interface designed for creative professionals. Focuses on frictionless transactions with a calm, glassmorphic UI that prioritizes clarity over visual noise.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=800&q=80',
    tags: ['UI/UX', 'Glassmorphism', 'Web App', 'Fintech'],
    link: '#lumina-pay-case-study',
    year: 2026
  },
  {
    id: 'aura-analytics',
    title: 'Aura Analytics',
    category: 'SAAS DASHBOARD',
    description: 'Transforming complex data sets into beautiful, readable environmental displays. The dashboard uses subtle tonal shifts instead of heavy shadows to indicate elevation.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    tags: ['Dashboard', 'Data Viz', 'SaaS', 'Systems Design'],
    link: '#aura-analytics-case-study',
    year: 2025
  },
  {
    id: 'minimal-notes',
    title: 'Zen Workspace',
    category: 'PRODUCTIVITY TOOL',
    description: 'A distraction-free thinking and writing environment utilizing adaptive typographic scales and a contextual command menu.',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    tags: ['Interaction Design', 'Typography', 'SPA', 'Minimalism'],
    link: '#zen-workspace-case-study',
    year: 2025
  },
  {
    id: 'aether-sound',
    title: 'Aether Sound',
    category: 'AUDIO INTERFACE',
    description: 'An interactive synthesiser and ambient generator designed to aid focus. It visually translates frequency spectrums into organic waveforms.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    tags: ['Audio Processing', 'Creative Coding', 'WebGL', 'UI/UX'],
    link: '#aether-sound-case-study',
    year: 2024
  },
  {
    id: 'forma-studio',
    title: 'Forma Studio',
    category: 'SPATIAL TOOL',
    description: 'A lightweight 3D spatial editor for architects. Supports real-time collaborative drafting in virtual workspace environments with simple gesture controls.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    tags: ['3D Modeling', 'Spatial UI', 'Collaboration', 'Product Design'],
    link: '#forma-studio-case-study',
    year: 2024
  },
  {
    id: 'komorebi-journal',
    title: 'Komorebi Journal',
    category: 'MOBILE UTILITY',
    description: 'A mindful daily journaling companion that captures mood patterns and aligns layout colors to match the ambient weather and natural daylight cycles.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    tags: ['React Native', 'Mobile UX', 'Health & Wellness', 'Micro-Interactions'],
    link: '#komorebi-journal-case-study',
    year: 2023
  }
];

const PROJECTS_ZH: Project[] = [
  {
    id: 'lumina-pay',
    title: 'Lumina Pay',
    category: '金融科技平台',
    description: '专为创意专业人士设计的极简支付界面。专注于无摩擦交易，采用宁静的玻璃拟态 UI，优先考虑清晰度，杜绝视觉干扰。',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=800&q=80',
    tags: ['UI/UX', '玻璃拟态', '网页应用', '金融科技'],
    link: '#lumina-pay-case-study',
    year: 2026
  },
  {
    id: 'aura-analytics',
    title: 'Aura Analytics',
    category: 'SAAS 数据看板',
    description: '将复杂的数据集转化为美观、易读的环境数据展示。看板使用微妙的色调变化而非沉重的投影来表现层级结构。',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    tags: ['数据看板', '数据可视化', 'SaaS', '系统设计'],
    link: '#aura-analytics-case-study',
    year: 2025
  },
  {
    id: 'minimal-notes',
    title: 'Zen Workspace',
    category: '生产力工具',
    description: '一个无干扰的思考与写作环境，采用自适应排版比例和上下文快捷命令菜单。',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    tags: ['交互设计', '排版艺术', '单页应用', '极简主义'],
    link: '#zen-workspace-case-study',
    year: 2025
  },
  {
    id: 'aether-sound',
    title: 'Aether Sound',
    category: '音频交互界面',
    description: '一款旨在帮助专注的互动合成器与氛围音效生成器。它能将音频频谱直观地转化为有机的波动形态。',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    tags: ['音频处理', '创意编程', 'WebGL', 'UI/UX'],
    link: '#aether-sound-case-study',
    year: 2024
  },
  {
    id: 'forma-studio',
    title: 'Forma Studio',
    category: '空间设计工具',
    description: '一款面向建筑师的轻量级 3D 空间编辑器。支持虚拟工作区环境中的实时协同设计与简易手势控制。',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    tags: ['3D 建模', '空间 UI', '协同工作', '产品设计'],
    link: '#forma-studio-case-study',
    year: 2024
  },
  {
    id: 'komorebi-journal',
    title: 'Komorebi Journal',
    category: '移动端应用',
    description: '一款关注心灵的日常日记伴侣，可捕捉情绪波动模式，并自动调整布局配色，以匹配周围天气和自然光线周期。',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    tags: ['React Native', '移动端 UX', '健康与福祉', '微交互'],
    link: '#komorebi-journal-case-study',
    year: 2023
  }
];

const EXPERIENCE_EN: ExperienceItem[] = [
  {
    id: 'exp-1',
    role: 'Senior UX/UI Designer',
    company: 'Digital Craftsmanship Inc.',
    companyDescription: 'A premium digital agency focusing on custom-crafted branding, software interfaces, and visual systems for enterprise and startup clients.',
    location: 'San Francisco, CA (Hybrid)',
    period: '2021 - Present',
    bullets: [
      'Led design systems overhaul, improving development speed by 30%.',
      'Mentored junior designers and established design review processes.',
      'Designed core features for a flagship SaaS product reaching 1M+ users.'
    ]
  },
  {
    id: 'exp-2',
    role: 'Product Designer',
    company: 'TechNova Solutions',
    companyDescription: 'An agile technology product company specializing in scalable cloud applications, data analytics platforms, and workflow automation tools.',
    location: 'Austin, TX (Remote)',
    period: '2018 - 2021',
    bullets: [
      'Collaborated with cross-functional teams to launch 3 major product updates.',
      'Conducted user research resulting in a 25% increase in user retention.',
      'Created high-fidelity prototypes for stakeholder presentations.'
    ]
  },
  {
    id: 'exp-3',
    role: 'Junior Visual Designer',
    company: 'Creative Agency Co.',
    companyDescription: 'A boutique marketing and design house dedicated to crafting unique brand identities, interactive storytelling, and packaging design.',
    location: 'New York, NY',
    period: '2016 - 2018',
    bullets: [
      'Designed marketing collateral and branding materials for diverse clients.',
      'Assisted in website redesigns, focusing on mobile responsiveness.',
      'Developed custom iconography and illustration sets.'
    ]
  }
];

const EXPERIENCE_ZH: ExperienceItem[] = [
  {
    id: 'exp-1',
    role: '资深 UI/UX 设计师',
    company: 'Digital Craftsmanship Inc.',
    companyDescription: '一家专注于为企业和初创客户定制高品质品牌形象、软件界面与视觉系统的优质数字化代理商。',
    location: '旧金山, 加利福尼亚州 (混合办公)',
    period: '2021 - 至今',
    bullets: [
      '主导设计系统重构，使前端开发效率提升 30%。',
      '指导初级设计师，建立并规范设计评审流程。',
      '为拥有百万级用户的核心旗舰 SaaS 产品设计主功能流程。'
    ]
  },
  {
    id: 'exp-2',
    role: '产品设计师',
    company: 'TechNova Solutions',
    companyDescription: '一家专注于高可扩展性云应用、数据分析平台及工作流自动化工具的敏捷科技产品公司。',
    location: '奥斯汀, 德克萨斯州 (远程办公)',
    period: '2018 - 2021',
    bullets: [
      '与跨功能团队密切合作，成功发布 3 次重大产品更新。',
      '开展深入的用户调研，帮助提高 25% 的用户留存率。',
      '主导制作高保真交互原型，并进行利益相关者汇报。'
    ]
  },
  {
    id: 'exp-3',
    role: '初级视觉设计师',
    company: 'Creative Agency Co.',
    companyDescription: '一家专注于打造独特品牌视觉体系、互动叙事及包装设计的精品创意与营销设计工作室。',
    location: '纽约, 纽约州',
    period: '2016 - 2018',
    bullets: [
      '为多元化的客户群设计营销材料与品牌视觉宣传册。',
      '协助进行响应式网站改版设计，聚焦移动端完美体验。',
      '创意并绘制自定义图标集与矢量插画系列。'
    ]
  }
];

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // SEO & Meta
    'seo.home.title': 'Digital Craftsmanship & Product Design | Portfolio',
    'seo.home.desc': 'Welcome to the digital craftsmanship & product design portfolio. Explore intuitive, elegant, and high-performance digital products and systems design.',
    'seo.portfolio.title': 'Selected Projects | Portfolio',
    'seo.portfolio.desc': 'A curated gallery of products, interfaces, and visual systems designed to merge function with digital craftsmanship.',
    'seo.experience.title': 'Experience & Skills | Portfolio',
    'seo.experience.desc': 'A chronological journey through my professional career, highlighting key roles, projects, and my core technical capabilities.',
    'seo.contact.title': "Let's Connect | Portfolio",
    'seo.contact.desc': 'Get in touch for new opportunities, creative collaborations, or custom product design and engineering solutions.',

    // Header
    'nav.home': 'Home',
    'nav.portfolio': 'Portfolio',
    'nav.experience': 'Experience',
    'nav.contact': 'Contact',
    'nav.search': 'Search projects...',
    'nav.soundOn': 'Mute toggle sound',
    'nav.soundOff': 'Unmute toggle sound',
    
    // HomeScreen
    'home.hero.title1': 'Digital Craftsmanship',
    'home.hero.title2': '& Product Design',
    'home.hero.subtitle': 'Creating intuitive, elegant, and performance-driven digital experiences. Blending minimalist aesthetics with robust engineering to build products that matter.',
    'home.hero.btnWork': 'View Work',
    'home.hero.btnAbout': 'About Me',
    'home.hero.scroll': 'Scroll',
    'home.philosophy.title': 'The Philosophy Behind the Pixels',
    'home.philosophy.p1': 'I believe that great design is invisible. It guides the user without friction, prioritizing clarity and intent over unnecessary ornamentation. My approach is rooted in understanding human behavior and translating complex problems into elegant, accessible solutions.',
    'home.philosophy.p2': 'With over a decade of experience bridging the gap between design and engineering, I focus on creating systems that scale gracefully while maintaining a meticulous attention to detail at the micro-level.',
    'home.philosophy.yearsExp': 'Years Experience',
    'home.philosophy.projectsShipped': 'Projects Shipped',

    // PortfolioScreen
    'portfolio.headerTag': 'My Portfolio',
    'portfolio.title': 'Selected Projects',
    'portfolio.desc': 'A curated gallery of products, interfaces, and visual systems designed to merge function with digital craftsmanship.',
    'portfolio.filter': 'Filter:',
    'portfolio.viewCaseStudy': 'VIEW CASE STUDY',
    'portfolio.more': 'more',
    'portfolio.projectDetails': 'PROJECT DETAILS',
    'portfolio.overview': 'Overview',
    'portfolio.techUsed': 'Technologies Used',
    'portfolio.close': 'Close',
    'portfolio.externalLink': 'Visit Live Project',
    'portfolio.launchDemo': 'Launch Demo',

    // ExperienceScreen
    'experience.headerTag': 'My Path',
    'experience.title': 'Experience',
    'experience.desc': 'A chronological journey through my professional career, highlighting key roles, projects, and the impact delivered at each stage.',
    'experience.skillsHeaderTag': 'Skills & Proficiencies',
    'experience.skillsTitle': 'Technical Capabilities',
    'experience.skillsDesc': 'A visual overview of the tools, technologies, and methodologies I master to create digital craftsmanship.',
    'experience.skillsTech': 'Technologies & Frameworks',
    'experience.years': 'years',
    'experience.year': 'year',

    // SkillsGrid (Categories & Skills translation keys inside are loaded natively, but we can localize their title & description labels)
    'skills.ui-ux.title': 'UI/UX Design',
    'skills.ui-ux.desc': 'Creating high-fidelity, polished, and intuitive interface layouts centered around human behaviors.',
    'skills.frontend.title': 'Frontend Development',
    'skills.frontend.desc': 'Translating design concepts into clean, pixel-perfect, and exceptionally performant web code.',
    'skills.creative.title': 'Creative Technology & Tooling',
    'skills.creative.desc': 'Leveraging modern frameworks, tooling, and media concepts to enhance digital performance.',
    'skills.strategy.title': 'Product Strategy & Quality',
    'skills.strategy.desc': 'Ensuring absolute structural integrity, user accessibility, and design alignment during shipping.',

    // ContactScreen
    'contact.headerTag': 'Contact',
    'contact.title': "Let's Connect",
    'contact.desc': 'I am always open to discussing new design challenges, spatial systems, collaborative product structures, or architectural opportunities.',
    'contact.info.location': 'Based In',
    'contact.info.locationVal': 'San Francisco, California',
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
    'footer.copyright': '© {year} Digital Craftsmanship. All rights reserved.',
  },
  zh: {
    // SEO & Meta
    'seo.home.title': '数字化匠心与产品设计 | 个人作品集',
    'seo.home.desc': '欢迎来到数字化匠心与产品设计作品集。探索直观、优雅和高性能的数字产品与系统设计。',
    'seo.portfolio.title': '精选项目 | 作品集',
    'seo.portfolio.desc': '精心策划的产品、界面和视觉系统展厅，旨在将功能与数字化美学完美融合。',
    'seo.experience.title': '工作经历与技能 | 作品集',
    'seo.experience.desc': '我的职业生涯成长轨迹，重点展示关键角色、项目和核心技术能力。',
    'seo.contact.title': '取得联系 | 作品集',
    'seo.contact.desc': '期待与您就新机遇、创意合作或定制化产品设计与工程解决方案展开交流。',

    // Header
    'nav.home': '首页',
    'nav.portfolio': '作品集',
    'nav.experience': '履历',
    'nav.contact': '联系',
    'nav.search': '搜索项目...',
    'nav.soundOn': '静音开关提示音',
    'nav.soundOff': '开启开关提示音',
    
    // HomeScreen
    'home.hero.title1': '数字化匠心',
    'home.hero.title2': '与产品设计',
    'home.hero.subtitle': '打造直观、优雅和性能驱动的数字体验。将极简主义美学与扎实的工程技术相结合，构建真正有价值的产品。',
    'home.hero.btnWork': '精选作品',
    'home.hero.btnAbout': '关于我',
    'home.hero.scroll': '向下滑动',
    'home.philosophy.title': '像素背后的设计哲学',
    'home.philosophy.p1': '我相信伟大的设计是无形的。它能无缝引导用户，优先考虑清晰度与核心意图，摒弃无谓的堆砌与雕琢。我的设计方法深植于对人类行为的理解，并致力于将复杂的痛点转化为优雅、易用的解决方案。',
    'home.philosophy.p2': '在连接设计与工程领域的十余年里，我专注于构建能够优雅扩展的系统，同时在微观层面保持对细节的极致关注。',
    'home.philosophy.yearsExp': '从业年限',
    'home.philosophy.projectsShipped': '上线产品',

    // PortfolioScreen
    'portfolio.headerTag': '我的作品集',
    'portfolio.title': '精选项目',
    'portfolio.desc': '精心策划的产品、界面和视觉系统画廊，致力于将核心功能与完美的像素打磨有机融合。',
    'portfolio.filter': '筛选:',
    'portfolio.viewCaseStudy': '查看案例研究',
    'portfolio.more': '更多',
    'portfolio.projectDetails': '项目详情',
    'portfolio.overview': '项目概述',
    'portfolio.techUsed': '所用技术',
    'portfolio.close': '关闭',
    'portfolio.externalLink': '访问线上项目',
    'portfolio.launchDemo': '启动演示',

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
    'skills.ui-ux.title': 'UI/UX 设计',
    'skills.ui-ux.desc': '以用户行为为核心，设计高保真、精致且直观的界面排版。',
    'skills.frontend.title': '前端开发',
    'skills.frontend.desc': '将设计概念转化为纯净、像素级还原且极具性能优势的网页代码。',
    'skills.creative.title': '创意技术与工具应用',
    'skills.creative.desc': '利用现代框架、工具链及多媒体交互概念来提升软件的用户体验。',
    'skills.strategy.title': '产品战略与交付品质',
    'skills.strategy.desc': '确保产品在交付上线过程中拥有完美的架构完整度、无障碍可访问性及设计一致性。',

    // ContactScreen
    'contact.headerTag': '取得联系',
    'contact.title': '让我们开始沟通',
    'contact.desc': '我随时乐意与您探讨全新的设计挑战、空间界面体系、协同产品架构或数字化创新的可能。',
    'contact.info.location': '当前位于',
    'contact.info.locationVal': '旧金山, 加利福尼亚州',
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
      const saved = localStorage.getItem('portfolio_lang');
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
      localStorage.setItem('portfolio_lang', lang);
    } catch (e) {
      // Ignore localStorage issues
    }
  };

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('portfolio_sound');
      return saved === null ? true : saved === 'true';
    } catch (e) {
      return true;
    }
  });

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem('portfolio_sound', String(enabled));
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
