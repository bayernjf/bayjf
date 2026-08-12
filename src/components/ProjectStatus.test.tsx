/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../data/projectStatus', () => ({
  PROJECT_STATUS: { 'one-world': 'delist', splity: 'soon' },
  isDelisted: (id: string) => id === 'one-world',
  isComingSoon: (id: string) => id === 'splity',
}));

import { LanguageProvider } from '../context/LanguageContext';
import { ToastProvider } from '../context/ToastContext';
import { LikeProvider } from '../context/LikeContext';
import BayjfScreen from './BayjfScreen';

function renderScreen() {
  return render(
    <LanguageProvider>
      <ToastProvider>
        <LikeProvider>
          <BayjfScreen />
        </LikeProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

describe('project status markers', () => {
  // 详情弹窗与 URL hash 双向同步，不清掉会让上一个用例的 #project-xxx 直接开弹窗。
  beforeEach(() => {
    window.location.hash = '';
  });

  it('hides delisted projects from the list', () => {
    renderScreen();
    expect(screen.queryByText('One World')).toBeNull();
    expect(screen.getByText('Splity')).toBeTruthy();
  });

  it('opens the coming-soon modal instead of the detail modal for soon projects', () => {
    renderScreen();
    fireEvent.click(screen.getByText('Splity'));
    expect(screen.getByText('Coming soon...')).toBeTruthy();
    expect(screen.queryByText('Overview')).toBeNull();
  });

  it('offers a website link in the coming-soon modal', () => {
    renderScreen();
    fireEvent.click(screen.getByText('Splity'));
    const link = screen.getByText('Website').closest('a');
    expect(link?.getAttribute('href')).toBe('https://splity-landing.pages.dev/');
  });

  it('opens the regular detail modal for unmarked projects', () => {
    renderScreen();
    fireEvent.click(screen.getByText('Termana'));
    expect(screen.getByText('Overview')).toBeTruthy();
    expect(screen.queryByText('Coming soon...')).toBeNull();
  });
});
