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
  level: number; // 0 to 100
  years: number;
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
    title: 'UI/UX Design',
    icon: PenTool,
    description: 'Creating high-fidelity, polished, and intuitive interface layouts centered around human behaviors.',
    skills: [
      { name: 'Interface Design & Layout', level: 95, years: 6 },
      { name: 'Design Systems Architecture', level: 90, years: 4 },
      { name: 'Motion & Spatial UI', level: 85, years: 3 },
      { name: 'Glassmorphism & Aesthetics', level: 92, years: 4 },
    ],
    tags: ['Figma', 'Interactive Prototyping', 'User Research', 'Wireframing', 'Color Theory', 'Typography']
  },
  {
    id: 'frontend',
    title: 'Frontend Development',
    icon: Code,
    description: 'Translating design concepts into clean, pixel-perfect, and exceptionally performant web code.',
    skills: [
      { name: 'React / Vite Architecture', level: 90, years: 5 },
      { name: 'TypeScript Integration', level: 85, years: 4 },
      { name: 'Tailwind CSS Mastery', level: 95, years: 5 },
      { name: 'Framer Motion (Animations)', level: 88, years: 3 },
    ],
    tags: ['ES6+ JS', 'CSS Grid/Flexbox', 'Responsive Design', 'HTML5 Canvas', 'Linter Config', 'Git']
  },
  {
    id: 'creative-tech',
    title: 'Creative Technology & Tooling',
    icon: Cpu,
    description: 'Leveraging modern frameworks, tooling, and media concepts to enhance digital performance.',
    skills: [
      { name: 'WebGL & Immersive Canvas', level: 75, years: 2 },
      { name: 'Performance Optimization', level: 82, years: 3 },
      { name: 'Audio & Visual Processing', level: 70, years: 2 },
      { name: 'API Design & Integration', level: 80, years: 4 },
    ],
    tags: ['Vite', 'Webpack', 'Three.js', 'Audio Synthesis', 'D3.js', 'SVG Manipulation', 'REST APIs']
  },
  {
    id: 'strategy',
    title: 'Product Strategy & Quality',
    icon: Award,
    description: 'Ensuring absolute structural integrity, user accessibility, and design alignment during shipping.',
    skills: [
      { name: 'Accessibility Standards (a11y)', level: 85, years: 4 },
      { name: 'SEO & Core Web Vitals', level: 80, years: 3 },
      { name: 'Design-to-Code Handoff', level: 95, years: 5 },
      { name: 'Iterative Prototyping', level: 90, years: 5 },
    ],
    tags: ['WCAG Guidelines', 'Lighthouse Optimization', 'Responsive QA', 'Feature Planning', 'Agile Delivery']
  }
];

export default function SkillsGrid() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const getTranslationId = (id: string) => id === 'creative-tech' ? 'creative' : id;

  const getSkillName = (name: string) => {
    const map: Record<string, string> = {
      'Interface Design & Layout': language === 'en' ? 'Agent Workflow Design' : 'Agent 工作流设计',
      'Design Systems Architecture': language === 'en' ? 'Context & Tool Design' : '上下文与工具设计',
      'Motion & Spatial UI': language === 'en' ? 'Evaluation & Guardrails' : '评估与安全边界',
      'Glassmorphism & Aesthetics': language === 'en' ? 'Human-in-the-loop UX' : '人机协作体验',
      'React / Vite Architecture': language === 'en' ? 'Java / Spring Architecture' : 'Java / Spring 架构',
      'TypeScript Integration': language === 'en' ? 'API & Service Integration' : 'API 与服务集成',
      'Tailwind CSS Mastery': language === 'en' ? 'Database & Cache Systems' : '数据库与缓存系统',
      'Framer Motion (Animations)': language === 'en' ? 'Full-stack Delivery' : '全栈交付',
      'WebGL & Immersive Canvas': language === 'en' ? 'LLM & AI API Integration' : '大模型与 AI API 集成',
      'Performance Optimization': language === 'en' ? 'Agent Reliability' : 'Agent 可靠性',
      'Audio & Visual Processing': language === 'en' ? 'RAG & Knowledge Workflows' : 'RAG 与知识工作流',
      'API Design & Integration': language === 'en' ? 'Enterprise API Design' : '企业级 API 设计',
      'Accessibility Standards (a11y)': language === 'en' ? 'Accessibility Standards (a11y)' : 'Estándares de Accesibilidad (a11y)',
      'SEO & Core Web Vitals': language === 'en' ? 'SEO & Core Web Vitals' : 'Métricas SEO y Core Web Vitals',
      'Design-to-Code Handoff': language === 'en' ? 'Design-to-Code Handoff' : 'Traspaso de Diseño a Código',
      'Iterative Prototyping': language === 'en' ? 'Iterative Prototyping' : 'Prototipado Iterativo',
    };
    return map[name] || name;
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

                {/* Progress bars */}
                <div className="space-y-4 mb-6">
                  {category.skills.map((skill) => (
                    <div key={skill.name} className="space-y-1.5">
                      <div className="flex justify-between items-end">
                        <span className="font-sans text-xs font-semibold text-[#1b1c1b] dark:text-[#fbf9f7]">
                          {getSkillName(skill.name)}
                        </span>
                        <span className="font-mono text-[11px] text-[#444748]/70 dark:text-[#c4c7c7]/70 font-semibold">
                          {skill.years} {skill.years === 1 ? t('experience.year') : t('experience.years')}
                        </span>
                      </div>
                      
                      {/* Bar container */}
                      <div className="w-full h-1.5 bg-[#e4e2e0]/60 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                          className="h-full bg-[#54615b] dark:bg-[#bbcac2] rounded-full shadow-[0_0_8px_rgba(84,97,91,0.2)]"
                        />
                      </div>
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
