import type { Language } from './translations';
import type { ScreenType } from '../types';

export type { Language } from './translations';

export type ScreenKey = 'home' | 'bayjf' | 'experience' | 'contact';

const SCREEN_TO_PATH: Record<ScreenKey, string> = {
  home: '',
  bayjf: 'projects',
  experience: 'experience',
  contact: 'contact',
};

export function baseForLang(lang: Language): string {
  return lang === 'en' ? '' : `/${lang}`;
}

export function screenToPath(screen: ScreenKey, lang: Language): string {
  const base = baseForLang(lang);
  const sub = SCREEN_TO_PATH[screen];
  if (!sub) return base || '/';
  return `${base}/${sub}`;
}

export function swapLocale(pathname: string, next: Language): string {
  const stripped = pathname.replace(/^\/(en|zh)(?=\/|$)/, '') || '/';
  if (next === 'en') return stripped === '/' ? '/' : stripped;
  return stripped === '/' ? '/zh' : `/zh${stripped}`;
}

export function screenFromPath(pathname: string): ScreenKey {
  const cleaned = pathname.replace(/^\/(en|zh)(?=\/|$)/, '');
  if (cleaned.startsWith('/projects')) return 'bayjf';
  if (cleaned.startsWith('/experience')) return 'experience';
  if (cleaned.startsWith('/contact')) return 'contact';
  return 'home';
}

export const SCREEN_TYPE_FROM_KEY: Record<ScreenKey, ScreenType> = {
  home: 'home',
  bayjf: 'bayjf',
  experience: 'experience',
  contact: 'contact',
};
