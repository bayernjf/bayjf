/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MouseEvent } from 'react';
import { Hourglass, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Project } from '../types';

interface ComingSoonBodyProps {
  project: Project;
  /** 卡片背面用的紧凑排版；弹窗用默认尺寸。 */
  compact?: boolean;
}

export default function ComingSoonBody({ project, compact = false }: ComingSoonBodyProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center text-center gap-3">
      <span
        className={`flex items-center justify-center rounded-2xl bg-sage/10 dark:bg-white/5 text-sage dark:text-mint ${
          compact ? 'w-11 h-11' : 'w-14 h-14'
        }`}
      >
        <Hourglass size={compact ? 20 : 24} />
      </span>

      <div className="space-y-1">
        <span className="block font-sans text-[10px] font-bold tracking-widest uppercase text-ink-soft/60 dark:text-mist/50">
          {project.title}
        </span>
        <h2
          className={`font-serif font-bold tracking-tight ${
            compact ? 'text-2xl' : 'text-3xl md:text-4xl'
          }`}
        >
          {t('bayjf.comingSoon')}
        </h2>
      </div>

      <p
        className={`font-sans leading-relaxed text-ink-soft dark:text-mist ${
          compact ? 'text-xs line-clamp-3 max-w-[240px]' : 'text-sm max-w-xs'
        }`}
      >
        {t('bayjf.comingSoonDesc')}
      </p>

      {project.link && (
        <a
          id={`coming-soon-external-link-${project.id}${compact ? '-card' : ''}`}
          href={project.link}
          // 卡片背面：链接嵌在可点击的卡片里，不拦住冒泡会同时弹出 Coming soon 弹窗。
          onClick={(event: MouseEvent) => event.stopPropagation()}
          className={`interactive flex items-center justify-center gap-2 rounded-full bg-sage hover:bg-ink dark:bg-mint dark:hover:bg-paper text-paper dark:text-ink font-sans uppercase tracking-widest font-semibold transition-all duration-300 shadow-md ${
            compact ? 'mt-1 py-2 px-5 text-[11px]' : 'mt-2 py-2.5 px-6 text-xs'
          }`}
        >
          <span>{t('bayjf.website')}</span>
          <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
}
