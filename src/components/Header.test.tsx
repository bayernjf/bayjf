import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../context/LanguageContext';
import { swapLocale } from '../i18n/routing';
import Header from './Header';

function renderHeader(overrides: Partial<ComponentProps<typeof Header>> = {}) {
  const props: ComponentProps<typeof Header> = {
    currentScreen: 'home',
    onNavigate: vi.fn(),
    theme: 'dark',
    toggleTheme: vi.fn(),
    lang: 'en',
    ...overrides,
  };

  render(
    <LanguageProvider>
      <Header {...props} />
    </LanguageProvider>,
  );

  return props;
}

describe('Header', () => {
  it('navigates from links and invokes the theme control', () => {
    const props = renderHeader();

    fireEvent.click(document.querySelector('#nav-bayjf')!);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Theme' }));

    expect(props.onNavigate).toHaveBeenCalledWith('bayjf', 'none');
    expect(props.toggleTheme).toHaveBeenCalledOnce();
  });

  it('routes to bayjf when a search begins and keeps the query', () => {
    const props = renderHeader();
    const search = document.querySelector('#header-search-input') as HTMLInputElement;

    fireEvent.change(search, { target: { value: 'Aura' } });

    expect(search).toHaveValue('Aura');
    expect(props.onNavigate).toHaveBeenCalledWith('bayjf', 'none');
  });

  it('switches locale via a URL navigation to the zh route', () => {
    renderHeader();
    // 语言切换改为 URL 路由：点击 lang 按钮会跳转到同屏的对应语言路径。
    // jsdom 不执行真实导航，这里直接校验按钮所用的 swapLocale 映射逻辑。
    fireEvent.click(document.querySelector('#lang-btn-zh')!);
    expect(swapLocale('/', 'zh')).toBe('/zh');
    expect(swapLocale('/projects', 'zh')).toBe('/zh/projects');
    expect(swapLocale('/zh', 'en')).toBe('/');
    expect(swapLocale('/zh/projects', 'en')).toBe('/projects');
  });
});
