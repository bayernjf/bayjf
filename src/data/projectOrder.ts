/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 项目展示顺序：en / zh 共用，由我自己在本文件维护。
 *
 * 约定：
 * 1. 在 PROJECTS_EN / PROJECTS_ZH 里加新项目后，把对应 id 插到本数组的期望位置。
 * 2. 只想调整展示顺序？只动本文件，无需改 LanguageContext 里的数据。
 * 3. 遗漏的 id 会排到末尾，dev 期 console 会告警。
 */
export const PROJECT_ORDER: readonly string[] = [
  'soft-desk',
  'word-picker',
  'word-base',
  
  'agent-dev',
  'pr-helper',
  'tab-manager',
  
  'termana',
  'vfx-todo',
  'toclick',

  'know-collect',
  'one-code',
  'one-world',
  
  'shareit',
  'splity',
];

/**
 * 按 PROJECT_ORDER 排序。列表里没写的 id 排到末尾（防御性，避免漏维护导致丢项目）。
 */
export const sortProjectsByOrder = <T extends { id: string }>(
  list: T[]
): T[] => {
  const orderIndex = new Map<string, number>(
    PROJECT_ORDER.map((id, i) => [id, i])
  );
  const tail = orderIndex.size;
  return [...list].sort((a, b) => {
    const ai = orderIndex.get(a.id) ?? tail;
    const bi = orderIndex.get(b.id) ?? tail;
    return ai - bi;
  });
};
