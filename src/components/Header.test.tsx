import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../context/LanguageContext';
import Header from './Header';

function renderHeader(overrides: Partial<ComponentProps<typeof Header>> = {}) {
  const props: ComponentProps<typeof Header> = {
    currentScreen: 'home',
    onNavigate: vi.fn(),
    theme: 'dark',
    toggleTheme: vi.fn(),
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

  it('changes the displayed navigation language', () => {
    renderHeader();

    fireEvent.click(document.querySelector('#lang-btn-zh')!);

    expect(document.querySelector('#nav-experience')).toHaveTextContent('履历');
    expect(localStorage.getItem('bayjf_lang')).toBe('zh');
  });
});
