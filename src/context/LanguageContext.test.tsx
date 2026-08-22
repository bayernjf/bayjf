import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { LanguageProvider, PROJECTS_EN, PROJECTS_ZH, useLanguage } from './LanguageContext';
import { PROJECT_IDS, getProjectStatus } from '../data/projectCatalog';

const visibleIds = PROJECT_IDS.filter((id) => getProjectStatus(id) !== 'delist');
const LISTED_COUNT = visibleIds.length;
const FIRST_VISIBLE_PROJECT_EN = PROJECTS_EN.find((project) => project.id === visibleIds[0])!;
const FIRST_VISIBLE_PROJECT_ZH = PROJECTS_ZH.find((project) => project.id === visibleIds[0])!;

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('LanguageProvider', () => {
  it('uses English defaults and interpolates translation variables', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.language).toBe('en');
    expect(result.current.projects).toHaveLength(LISTED_COUNT);
    expect(result.current.projects[0].title).toBe(FIRST_VISIBLE_PROJECT_EN.title);
    expect(result.current.t('footer.copyright', { year: 2026 })).toContain('2026');
    expect(result.current.t('unknown.translation')).toBe('unknown.translation');
  });

  it('switches localized data and persists user preferences', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    act(() => {
      result.current.setLanguage('zh');
      result.current.setSoundEnabled(false);
      result.current.setSearchQuery('dashboard');
    });

    expect(result.current.language).toBe('zh');
    expect(result.current.t('nav.bayjf')).toBe('案例');
    expect(result.current.projects[0].category).toBe(FIRST_VISIBLE_PROJECT_ZH.category);
    expect(result.current.searchQuery).toBe('dashboard');
    expect(localStorage.getItem('bayjf_lang')).toBe('zh');
    expect(localStorage.getItem('bayjf_sound')).toBe('false');
  });

  it('restores language and sound settings from storage', () => {
    localStorage.setItem('bayjf_lang', 'zh');
    localStorage.setItem('bayjf_sound', 'false');

    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.language).toBe('zh');
    expect(result.current.soundEnabled).toBe(false);
  });
});
