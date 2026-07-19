import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { LanguageProvider, useLanguage } from './LanguageContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('LanguageProvider', () => {
  it('uses English defaults and interpolates translation variables', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.language).toBe('en');
    expect(result.current.projects).toHaveLength(6);
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
    expect(result.current.t('nav.portfolio')).toBe('作品集');
    expect(result.current.projects[0].category).toBe('金融科技平台');
    expect(result.current.searchQuery).toBe('dashboard');
    expect(localStorage.getItem('portfolio_lang')).toBe('zh');
    expect(localStorage.getItem('portfolio_sound')).toBe('false');
  });

  it('restores language and sound settings from storage', () => {
    localStorage.setItem('portfolio_lang', 'zh');
    localStorage.setItem('portfolio_sound', 'false');

    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.language).toBe('zh');
    expect(result.current.soundEnabled).toBe(false);
  });
});
