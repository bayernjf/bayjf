/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';
import ComingSoonBody from './ComingSoonBody';
import { Project } from '../types';

interface ComingSoonFlipCardProps {
  project: Project;
  flipped: boolean;
  /** 正面容器的布局类：grid 卡片是竖排，timeline 卡片是横排。 */
  faceClassName: string;
  className?: string;
  children: ReactNode;
}

/**
 * 翻转挂在这层，而不是外层的 TiltCard：那里的 rotateX/rotateY 由 motion 的
 * spring 接管，在同一元素上再写 rotateY 会互相覆盖抖动。
 */
export default function ComingSoonFlipCard({
  project,
  flipped,
  faceClassName,
  className = '',
  children,
}: ComingSoonFlipCardProps) {
  return (
    <div className={`relative w-full perspective-[1200px] ${className}`}>
      <div
        id={`card-flip-${project.id}`}
        className={`relative h-full transform-3d transition-transform duration-700 ease-out motion-reduce:transition-none ${
          flipped ? 'rotate-y-180' : ''
        }`}
      >
        <div className={`backface-hidden ${faceClassName}`}>{children}</div>
        <div className="absolute inset-0 rotate-y-180 backface-hidden flex items-center justify-center p-6 bg-paper-raised dark:bg-night-raised">
          <ComingSoonBody project={project} compact />
        </div>
      </div>
    </div>
  );
}
