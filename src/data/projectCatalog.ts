/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 项目目录：en / zh 共用，一处同时维护「展示顺序」和「上线状态」。
 *
 * 每项可以是：
 *   'soft-desk'                     // 字符串 = id，状态默认 launch
 *   { id: 'agent-dev', s: 'soon' }  // 对象 = 显式状态
 *
 * 状态语义：
 *   launch  已上线，正常展示卡片并打开详情（默认，无需写）
 *   soon    展示卡片，点击弹 “Coming soon...”
 *   delist  完全不出现在列表/图表/计数/深链
 *
 * 改顺序直接挪位置；改状态把字符串换成对象即可。
 * 加新项目后，记得在 PROJECTS_EN / PROJECTS_ZH 里补上对应数据。
 */
export type ProjectStatus = 'delist' | 'soon' | 'launch';

type CatalogEntry = string | { id: string; s: ProjectStatus };

const CATALOG: readonly CatalogEntry[] = [
  'soft-desk',
  'word-picker',
  'word-base',

  { id: 'agent-dev', s: 'soon' },
  'pr-helper',
  'tab-manager',

  'termana',
  'vfx-todo',
  { id: 'toclick', s: 'soon' },

  { id: 'know-collect', s: 'soon' },
  { id: 'one-code', s: 'soon' },
  { id: 'one-world', s: 'soon' },

  { id: 'shareit', s: 'soon' },
  { id: 'splity', s: 'soon' },

  { id: 'work-learn', s: 'soon' },
];

const entryId = (entry: CatalogEntry): string =>
  typeof entry === 'string' ? entry : entry.id;

const entryStatus = (entry: CatalogEntry): ProjectStatus =>
  typeof entry === 'string' ? 'launch' : entry.s;

/** 全部已声明 id，按展示顺序。 */
export const PROJECT_IDS: readonly string[] = CATALOG.map(entryId);

const STATUS_BY_ID: Readonly<Record<string, ProjectStatus>> =
  Object.fromEntries(CATALOG.map((entry) => [entryId(entry), entryStatus(entry)]));

export const getProjectStatus = (id: string): ProjectStatus =>
  STATUS_BY_ID[id] ?? 'launch';

export const isDelisted = (id: string): boolean => getProjectStatus(id) === 'delist';

export const isComingSoon = (id: string): boolean => getProjectStatus(id) === 'soon';

/**
 * 按目录顺序排序。列表里没写的 id 排到末尾（防御性，避免漏维护导致丢项目），
 * dev 期会在 LanguageContext 里告警。
 */
export const sortProjectsByOrder = <T extends { id: string }>(list: T[]): T[] => {
  const orderIndex = new Map<string, number>(PROJECT_IDS.map((id, i) => [id, i]));
  const tail = PROJECT_IDS.length;
  return [...list].sort((a, b) => {
    const ai = orderIndex.get(a.id) ?? tail;
    const bi = orderIndex.get(b.id) ?? tail;
    return ai - bi;
  });
};
