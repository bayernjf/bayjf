/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, type PointerEvent } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from 'motion/react';
import { ExternalLink, Link as LinkIcon, Check } from 'lucide-react';
import BlurUpImage from './BlurUpImage';
import LikeButton from './LikeButton';
import { useLanguage, Language } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/clipboard';
import { Project } from '../types';

interface FeaturedCopy {
  /** hero 正文：比卡片描述长，讲清产品在做什么。 */
  body: string;
  /** 3-4 条卖点，一行一条。 */
  highlights: readonly string[];
}

/**
 * 明星项目的长文案。哪个项目被置顶由 projectCatalog 的 f: true 决定，
 * 换明星项目时记得在这里补上对应 id 的文案，缺失时 hero 会退回卡片描述。
 */
const FEATURED_COPY: Record<Language, Record<string, FeaturedCopy>> = {
  en: {
    'agent-world': {
      body: 'Agent World turns multi-agent orchestration into a base you can actually see. Every agent is a factory on the map, tokens are the power supply that keeps it running, and output moves downstream by pipe and truck instead of disappearing into a log file. Lay out the production line, watch throughput move, and debug a pipeline the way you would fix a stalled assembly floor.',
      highlights: [
        'Agents as factories on a live map — inputs, outputs, and idle time visible at a glance',
        'Tokens modelled as power: see which part of the pipeline is burning your budget',
        'Pipes and trucks carry output downstream, so hand-offs between agents stop being invisible',
        'Skill cards and RTS-style scheduling to grow the line instead of rewriting prompts'
      ]
    }
  },
  zh: {
    'agent-world': {
      body: 'Agent World 把多智能体编排变成一张看得见的地图。每个 Agent 是一座厂房，token 是维持运转的电力，产出通过管道与卡车运往下游，而不是消失在日志里。像规划厂区一样铺开流水线，实时看着产能流动，卡住的环节一眼就能定位。',
      highlights: [
        'Agent 就是地图上的厂房，输入、产出和空转一眼看清',
        'token 被建模成电力，哪一段流水线在烧预算立刻可见',
        '管道与卡车把产出运往下游，Agent 之间的交接不再是黑盒',
        '技能卡与 RTS 式调度，用扩建厂区的方式迭代，而不是反复改 prompt'
      ]
    }
  }
};

interface FeaturedProjectProps {
  project: Project;
}

export default function FeaturedProject({ project }: FeaturedProjectProps) {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const copy = FEATURED_COPY[language][project.id];
  const highlights = copy?.highlights ?? [];
  const productHref = `${language === 'zh' ? '/zh' : ''}/products/${project.id}`;

  // 明星项目专属光影：不用普通卡片的 TiltCard（这么大一块倾斜会晃、透视也失真），
  // 改成一束跟着指针在预览图上慢扫的 mint 色 glare，配合面板抬升与描边。
  const imageRef = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const glareSpring = { stiffness: 110, damping: 26, mass: 0.9 };
  const glareX = useSpring(useTransform(pointerX, [0, 1], [0, 100]), glareSpring);
  const glareY = useSpring(useTransform(pointerY, [0, 1], [0, 100]), glareSpring);
  const glareTarget = useMotionValue(0);
  const glareOpacity = useSpring(glareTarget, { stiffness: 150, damping: 30 });
  const glareBackground = useMotionTemplate`radial-gradient(ellipse 45% 60% at ${glareX}% ${glareY}%, rgba(255,255,255,0.22), rgba(143,174,157,0.26) 45%, transparent 72%)`;

  const handleImagePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (reduce || event.pointerType !== 'mouse' || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
    glareTarget.set(1);
  };

  const handleImagePointerLeave = () => {
    glareTarget.set(0);
  };

  const handleCopyShareLink = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#project-${project.id}`;
    const copied = await copyToClipboard(shareUrl);
    showToast(
      copied
        ? language === 'en' ? 'Project link copied to clipboard!' : '项目链接已复制到剪贴板！'
        : language === 'en' ? 'Failed to copy project link.' : '复制链接失败。',
      copied ? 'success' : 'error'
    );
  };

  return (
    <motion.div
      id={`featured-project-${project.id}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mb-14 md:mb-20 bg-paper-raised dark:bg-night-raised rounded-[28px] shadow-sm hover:shadow-2xl ring-1 ring-transparent hover:ring-mint/25 transition-shadow duration-500 overflow-hidden"
    >
      {/* 预览图整张横铺在上方（源图 16:10），下面再排长文案，
          这样不用 object-cover 裁图，也不会为了对齐两列而留一大片空白。 */}
      <a
        ref={imageRef}
        href={productHref}
        onPointerMove={handleImagePointerMove}
        onPointerLeave={handleImagePointerLeave}
        className="relative block w-full aspect-[16/10] overflow-hidden bg-paper dark:bg-night group"
      >
        <BlurUpImage
          src={project.image}
          alt={project.title}
          className="transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
        />
        {/* 指针跟随的柔光，只覆在图片上，不遮挡任何可点击内容 */}
        <motion.span
          aria-hidden="true"
          style={{ background: glareBackground, opacity: glareOpacity }}
          className="pointer-events-none absolute inset-0 z-20 mix-blend-soft-light dark:mix-blend-screen"
        />
      </a>

      <div className="flex flex-col p-7 md:p-10 lg:p-12">
        <span className="font-sans text-[11px] font-medium tracking-wider text-sage dark:text-mint uppercase flex items-center justify-between gap-3">
          <span>{project.category}</span>
          <span className="flex items-center gap-1.5">
            {project.date && (
              <span className="font-sans text-[9px] text-ink-soft/50 dark:text-mist/50 font-medium whitespace-nowrap">
                {project.date}
              </span>
            )}
            <LikeButton projectId={project.id} source="featured" enlarged />
          </span>
        </span>

        <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-ink dark:text-paper mt-3">
          <a href={productHref} className="hover:text-sage dark:hover:text-mint transition-colors duration-200">
            {project.title}
          </a>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mt-6">
          <p className="font-sans text-sm md:text-base leading-relaxed text-ink-soft dark:text-mist">
            {copy?.body ?? project.description}
          </p>

          {highlights.length > 0 && (
            <ul className="space-y-2.5">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 font-sans text-[13px] leading-relaxed text-ink-soft/90 dark:text-mist/90">
                  <Check size={15} className="shrink-0 mt-0.5 text-sage dark:text-mint" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-y-4 gap-x-6 mt-8 pt-7 border-t border-hairline/25 dark:border-white/5">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {project.link && (
              <a
                id={`featured-external-link-${project.id}`}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-sage hover:bg-ink dark:bg-mint dark:hover:bg-paper text-paper dark:text-ink font-sans text-xs font-bold tracking-wider transition-all duration-300 shadow-md"
              >
                <span>{t('bayjf.website')}</span>
                <ExternalLink size={13} />
              </a>
            )}
            <button
              id={`featured-share-link-${project.id}`}
              onClick={handleCopyShareLink}
              className="interactive flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-hairline/40 hover:bg-hairline/85 dark:bg-white/5 dark:hover:bg-white/10 text-ink dark:text-paper font-sans text-xs font-bold tracking-wider transition-all duration-300 border border-hairline/55 dark:border-white/5 shadow-sm"
            >
              <span>{language === 'en' ? 'Copy Share Link' : '复制分享链接'}</span>
              <LinkIcon size={13} />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:ml-auto sm:justify-end">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-sans text-[11px] bg-paper dark:bg-night border border-hairline/30 dark:border-white/5 text-ink-soft dark:text-mist px-2.5 py-1 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
