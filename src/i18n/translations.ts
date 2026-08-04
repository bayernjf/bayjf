export type Language = 'en' | 'zh';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // SEO & Meta
    'seo.home.title': 'AI Native Developer & AI Agent Builder | BayJF',
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
    'home.hero.title3': 'Traditional Workflow Optimization & Organizational Efficiency',
    'home.hero.subtitle': 'I help businesses and individuals turn AI Agent ideas into practical products, automated workflows, and measurable efficiency gains — from product definition to full-stack delivery.',
    'home.hero.btnWork': 'Real Cases',
    'home.hero.btnAbout': 'About Me',
    'home.hero.scroll': 'Scroll',
    'home.philosophy.title': 'Build the agent. Improve the work.',
    'home.philosophy.p1': 'I focus on turning complex work into clear, reliable systems. For AI Agent projects, that means understanding the real workflow first, then connecting models, tools, data, and human decisions into a product people can actually use.',
    'home.philosophy.p2': 'I bring enterprise Java delivery experience into my current AI Native practice, connecting product thinking, models, tools, data, and full-stack engineering.',
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
    'experience.headerTag': 'Career Experience',
    'experience.title': 'Experience',
    'experience.desc': 'Below is my professional experience to date; I currently focus on AI Agent delivery and full-stack development.',
    'experience.skillsHeaderTag': 'Skills & Proficiencies',
    'experience.skillsTitle': 'Technical Capabilities',
    'experience.skillsDesc': 'The practical AI Agent, Java full-stack, and enterprise delivery capabilities I use to turn ideas into working products.',
    'experience.skillsTech': 'Technologies & Frameworks',
    'experience.years': 'years',
    'experience.year': 'year',

    // SkillsGrid
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
    'contact.title': 'Contact Me for a Business Consultation',
    'contact.desc': 'Enterprise AI Agent consulting, full-stack product development and delivery, and AI-led improvements to organizational structure and efficiency.',
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
    'footer.copyright': '© {year} BayJF · AI Native / AI Agent Delivery. All rights reserved.',
  },
  zh: {
    // SEO & Meta
    'seo.home.title': 'AI Native 开发者与 AI Agent 落地 | BayJF',
    'seo.home.desc': 'AI Native 全栈开发者姜峰，帮助企业与个人落地 AI Agent、自动化工作流与效率工具。',
    'seo.bayjf.title': '精选项目 | BayJF',
    'seo.bayjf.desc': '展示 SoftDesk、WordBase、WordPicker 与 Tab Garden 等真实产品，记录从产品想法到全栈交付的实践。',
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
    'home.hero.title3': '传统工作流优化、组织效率提升',
    'home.hero.subtitle': '帮助企业与个人将 AI Agent 想法变成可用产品、自动化工作流和真实效率提升，从产品定义到全栈交付。',
    'home.hero.btnWork': '真实案例',
    'home.hero.btnAbout': '关于我',
    'home.hero.scroll': '向下滑动',
    'home.philosophy.title': '让 Agent 真正改善工作',
    'home.philosophy.p1': '我关注的是如何把复杂工作变成清晰、可靠的系统。做 AI Agent 时，我会先理解真实业务流程，再把模型、工具、数据和人的判断连接起来，交付真正能被使用的产品。',
    'home.philosophy.p2': '我可以承接国内和海外项目，加入 AI Agent 团队，或以远程方式从想法验证一路参与到生产交付。',
    'home.philosophy.yearsExp': 'AI Native 方向',
    'home.philosophy.projectsShipped': '真实产品案例',

    // BayjfScreen
    'bayjf.headerTag': '我的案例',
    'bayjf.title': '精选项目',
    'bayjf.desc': '这里展示我亲自构建的真实产品：桌面效率工具、语言学习工作台与浏览器扩展，记录 AI Native 的产品实践与全栈交付。',
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
    'experience.headerTag': '职业经历',
    'experience.title': '工作经历',
    'experience.desc': '以下是过往在职经历，目前聚焦 AI Agent 与全栈开发。',
    'experience.skillsHeaderTag': '专业技能',
    'experience.skillsTitle': '核心技术能力',
    'experience.skillsDesc': '我用于落地 AI Agent、Java 全栈系统与企业级交付的核心能力。',
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
    'contact.title': '随时联系我进行业务咨询',
    'contact.desc': 'AI Agent 的企业咨询服务、产品全栈开发与交付、AI 落地优化组织架构和效率提升。',
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
    'footer.copyright': '© {year} BayJF · AI Native / AI Agent 落地。保留所有权利。',
  },
};

export function translate(
  language: Language,
  key: string,
  variables?: Record<string, string | number>,
): string {
  const template = TRANSLATIONS[language][key] || TRANSLATIONS['en'][key] || key;
  if (!variables) return template;
  return Object.entries(variables).reduce(
    (acc, [name, val]) => acc.replace(`{${name}}`, String(val)),
    template,
  );
}

export type ScreenKey = 'home' | 'bayjf' | 'experience' | 'contact';

export const SEO_KEYS: Record<ScreenKey, { title: string; desc: string }> = {
  home: { title: 'seo.home.title', desc: 'seo.home.desc' },
  bayjf: { title: 'seo.bayjf.title', desc: 'seo.bayjf.desc' },
  experience: { title: 'seo.experience.title', desc: 'seo.experience.desc' },
  contact: { title: 'seo.contact.title', desc: 'seo.contact.desc' },
};
