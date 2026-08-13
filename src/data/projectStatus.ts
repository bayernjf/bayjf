/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 项目状态标记：en / zh 共用，由我自己在本文件维护。
 *
 * 约定：
 * 1. 'delist'：完全不出现在项目列表里（同时从技术栈图表、项目计数、深链里消失）。
 * 2. 'soon'：正常展示卡片，但点击后弹出 “Coming soon...” 而不是项目详情。
 * 3. 'launch'：已上线，正常展示卡片并打开项目详情。
 * 4. 没写在本文件里的项目 = 等同 'launch'，无需维护。
 * 5. 改了项目 id 后本文件会失效，dev 期 console 会告警。
 */
export type ProjectStatus = 'delist' | 'soon' | 'launch';

export const PROJECT_STATUS: Readonly<Record<string, ProjectStatus>> = {
  'soft-desk': 'launch',
  'word-picker': 'launch',
  'word-base': 'launch',
  'agent-dev': 'soon',
  'pr-helper': 'launch',
  'tab-garden': 'launch',
  'termana': 'launch',
  'vfx-todo': 'launch',
  'toclick': 'soon',
  'know-collect': 'soon',
  'one-code': 'soon',
  'one-world': 'soon',
  'shareit': 'soon',
  'splity': 'soon',
};

export const isDelisted = (id: string): boolean => PROJECT_STATUS[id] === 'delist';

export const isComingSoon = (id: string): boolean => PROJECT_STATUS[id] === 'soon';
