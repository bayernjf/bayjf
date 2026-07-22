/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { PenTool, Code, Cpu, Award, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Skill {
  name: string;
  evidence: string;
}

interface SkillCategory {
  id: string;
  title: string;
  icon: any;
  description: string;
  skills: Skill[];
  tags: string[];
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'ui-ux',
    title: 'AI Agent Engineering',
    icon: Cpu,
    description: '从真实业务流程出发，设计可执行、可评估、可持续迭代的 Agent 工作流。',
    skills: [
      { name: 'Agent Workflow Design', evidence: 'Applied' },
      { name: 'Tool Calling & Context', evidence: 'Applied' },
      { name: 'RAG & Knowledge Workflows', evidence: 'Applied' },
      { name: 'Evaluation & Guardrails', evidence: 'Applied' },
    ],
    tags: ['LLM APIs', 'Tool Calling', 'RAG', 'Prompt / Context', 'Evaluation']
  },
  {
    id: 'frontend',
    title: 'Java Full-stack Development',
    icon: Code,
    description: '覆盖企业 API、数据层与 Web 界面的全栈交付，连接 Agent 能力与真实业务系统。',
    skills: [
      { name: 'Java / Spring Boot', evidence: 'Core' },
      { name: 'REST API & Service Integration', evidence: 'Core' },
      { name: 'MySQL / Redis / SQL', evidence: 'Core' },
      { name: 'React / TypeScript Delivery', evidence: 'Applied' },
    ],
    tags: ['Java', 'Spring Boot', 'React', 'TypeScript', 'MySQL', 'Redis']
  },
  {
    id: 'creative-tech',
    title: 'AI Product Delivery',
    icon: PenTool,
    description: '把 AI 能力转化为可使用的产品、自动化流程和可感知的效率提升。',
    skills: [
      { name: 'Workflow Discovery', evidence: 'Applied' },
      { name: 'Human-in-the-loop UX', evidence: 'Applied' },
      { name: 'Desktop / Web Productization', evidence: 'Applied' },
      { name: 'API Design & Integration', evidence: 'Core' },
    ],
    tags: ['Electron', 'Tauri', 'Supabase', 'Hono', 'Vite', 'Product Discovery']
  },
  {
    id: 'strategy',
    title: 'Enterprise Systems & Collaboration',
    icon: Award,
    description: '理解企业业务约束，协同团队完成从需求、开发、测试到交付的完整闭环。',
    skills: [
      { name: 'DevOps & CI/CD Collaboration', evidence: 'Applied' },
      { name: 'Permissions & Business Workflows', evidence: 'Core' },
      { name: 'Data Processing & Reporting', evidence: 'Core' },
      { name: 'Testing, Documentation & Delivery', evidence: 'Core' },
    ],
    tags: ['DevOps', 'CI/CD', 'RBAC', 'SQL', 'Git', 'Agile Delivery']
  }
];

export default function SkillsGrid() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const getTranslationId = (id: string) => id === 'creative-tech' ? 'creative' : id;

  const getSkillName = (name: string) => {
    const map: Record<string, string> = {
      'Agent Workflow Design': 'Agent 工作流设计',
      'Tool Calling & Context': '工具调用与上下文',
      'RAG & Knowledge Workflows': 'RAG 与知识工作流',
      'Evaluation & Guardrails': '评估与安全边界',
      'Java / Spring Boot': 'Java / Spring Boot',
      'REST API & Service Integration': 'REST API 与服务集成',
      'MySQL / Redis / SQL': 'MySQL / Redis / SQL',
      'React / TypeScript Delivery': 'React / TypeScript 交付',
      'Workflow Discovery': '业务工作流梳理',
      'Human-in-the-loop UX': '人机协作体验',
      'Desktop / Web Productization': '桌面端 / Web 产品化',
      'API Design & Integration': 'API 设计与集成',
      'DevOps & CI/CD Collaboration': 'DevOps 与 CI/CD 协作',
      'Permissions & Business Workflows': '权限与业务流程',
      'Data Processing & Reporting': '数据处理与报表',
      'Testing, Documentation & Delivery': '测试、文档与交付',
    };
    return language === 'zh' ? (map[name] || name) : name;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="mt-32 pt-20 border-t border-[#e4e2e0]/60 dark:border-white/5">
      {/* Title block */}
      <div className="mb-16 text-center md:text-left">
        <span className="font-sans text-xs uppercase tracking-widest text-[#54615b] dark:text-[#bbcac2] font-bold flex items-center justify-center md:justify-start gap-2">
          <CheckCircle2 size={14} /> {t('experience.skillsHeaderTag')}
        </span>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7] mt-3 tracking-tight">
          {t('experience.skillsTitle')}
        </h2>
        <p className="font-sans text-base text-[#444748] dark:text-[#c4c7c7] mt-4 max-w-xl leading-relaxed">
          {t('experience.skillsDesc')}
        </p>
      </div>

      {/* Bento Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {SKILL_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isHovered = activeCategory === category.id;
          const transId = getTranslationId(category.id);

          return (
            <motion.div
              key={category.id}
              variants={itemVariants}
              onMouseEnter={() => setActiveCategory(category.id)}
              onMouseLeave={() => setActiveCategory(null)}
              className="group relative flex flex-col justify-between bg-[#fbf9f7] dark:bg-[#161716] p-6 md:p-8 rounded-2xl border border-[#e4e2e0] dark:border-white/5 shadow-md hover:shadow-xl hover:border-[#54615b]/20 dark:hover:border-white/10 transition-all duration-500 overflow-hidden"
            >
              <div>
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#54615b]/10 dark:bg-[#bbcac2]/10 flex items-center justify-center text-[#54615b] dark:text-[#bbcac2] group-hover:scale-110 transition-transform duration-300">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7]">
                    {t(`skills.${transId}.title`)}
                  </h3>
                </div>

                {/* Description */}
                <p className="font-sans text-sm text-[#444748] dark:text-[#c4c7c7] mb-6 leading-relaxed">
                  {t(`skills.${transId}.desc`)}
                </p>

                {/* Evidence-based capability list */}
                <div className="space-y-4 mb-6">
                  {category.skills.map((skill) => (
                    <div key={skill.name} className="space-y-1.5">
                      <div className="flex justify-between items-end">
                        <span className="font-sans text-xs font-semibold text-[#1b1c1b] dark:text-[#fbf9f7]">
                          {getSkillName(skill.name)}
                        </span>
                        <span className="font-mono text-[11px] text-[#444748]/70 dark:text-[#c4c7c7]/70 font-semibold">
                          {language === 'en' ? skill.evidence : skill.evidence === 'Core' ? '核心' : '实践'}
                        </span>
                      </div>
                      
                      <div className="w-full h-px bg-[#e4e2e0]/60 dark:bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-skills/Tags List */}
              <div className="pt-6 border-t border-[#e4e2e0]/40 dark:border-white/5">
                <span className="block font-sans text-[10px] font-bold tracking-wider text-[#444748]/50 dark:text-[#c4c7c7]/50 uppercase mb-3">
                  {t('experience.skillsTech')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {category.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-sans text-[11px] font-semibold bg-[#e4e2e0]/40 dark:bg-white/5 text-[#444748] dark:text-[#c4c7c7] px-2.5 py-1 rounded-md transition-colors duration-300 group-hover:bg-[#54615b]/5 dark:group-hover:bg-[#bbcac2]/5 group-hover:text-[#54615b] dark:group-hover:text-[#bbcac2]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
