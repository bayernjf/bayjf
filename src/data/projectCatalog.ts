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

export interface CatalogState {
  order: readonly string[];
  status: Record<string, ProjectStatus>;
}

type CatalogEntry = string | { id: string; s: ProjectStatus };

const CATALOG: readonly CatalogEntry[] = [
  { id: 'pr-helper', s: 'launch' },
  'agent-dev',
  'work-learn',

  'termana', 'one-code', 'tab-manager',

  'word-picker', 'soft-desk', 'vfx-todo',

  'word-base',
  { id: 'know-collect', s: 'soon' },
  { id: 'splity', s: 'soon' },

  { id: 'shareit', s: 'soon' },
  { id: 'one-world', s: 'soon' },
  { id: 'toclick', s: 'soon' },
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

/** 内置默认目录：顺序来自 CATALOG，状态只显式记录非 launch 的项目。 */
export const DEFAULT_CATALOG: CatalogState = {
  order: PROJECT_IDS,
  status: CATALOG.reduce<Record<string, ProjectStatus>>((acc, entry) => {
    if (typeof entry !== 'string') acc[entry.id] = entry.s;
    return acc;
  }, {}),
};

const STATUSES: readonly ProjectStatus[] = ['delist', 'soon', 'launch'];

/**
 * 把远端（Supabase / API）拿到的目录与默认值合并：
 * - 顺序里保留远端顺序，未出现的已知 id 追加到末尾，未知 id 丢弃。
 * - 状态以远端为准，缺失的项目回退到默认/launch。
 */
export function mergeCatalog(remote: unknown): CatalogState {
  if (!remote || typeof remote !== 'object') return DEFAULT_CATALOG;
  const remoteOrder = Array.isArray((remote as CatalogState).order)
    ? (remote as CatalogState).order.filter((id): id is string => typeof id === 'string')
    : [];
  const remoteStatus =
    (remote as CatalogState).status && typeof (remote as CatalogState).status === 'object'
      ? (remote as CatalogState).status
      : {};

  const known = new Set(PROJECT_IDS);
  const order = [...new Set(remoteOrder.filter((id) => known.has(id)))];
  for (const id of PROJECT_IDS) if (!order.includes(id)) order.push(id);

  const status: Record<string, ProjectStatus> = { ...DEFAULT_CATALOG.status };
  for (const [id, value] of Object.entries(remoteStatus)) {
    if (known.has(id) && STATUSES.includes(value as ProjectStatus)) {
      status[id] = value as ProjectStatus;
    }
  }
  return { order, status };
}

/** 按目录状态过滤（剔除 delist）并排序。 */
export function applyCatalog<T extends { id: string }>(list: T[], catalog: CatalogState): T[] {
  const index = new Map(catalog.order.map((id, i) => [id, i]));
  const tail = catalog.order.length;
  return list
    .filter((item) => catalog.status[item.id] !== 'delist')
    .sort((a, b) => (index.get(a.id) ?? tail) - (index.get(b.id) ?? tail));
}

export const isComingSoonFor = (id: string, catalog: CatalogState): boolean =>
  catalog.status[id] === 'soon';
export const isDelistedFor = (id: string, catalog: CatalogState): boolean =>
  catalog.status[id] === 'delist';
