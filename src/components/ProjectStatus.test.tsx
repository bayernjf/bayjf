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

import { LanguageProvider, PROJECTS_EN } from '../context/LanguageContext';
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

// 卡片正面标题是 h3，背面是 span —— 用 heading 角色锁定卡片正面。
const cardTitle = (name: string) => screen.getByRole('heading', { name });

const flipContainer = () => document.getElementById('card-flip-splity') as HTMLElement;
const backWebsiteLink = () =>
  document.getElementById('coming-soon-external-link-splity-card') as HTMLElement;
const isFlipped = () => flipContainer().className.includes('rotate-y-180');

describe('project status markers', () => {
  // 详情弹窗与 URL hash 双向同步，不清掉会让上一个用例的 #project-xxx 漏进来。
  beforeEach(() => {
    window.location.hash = '';
  });

  it('hides delisted projects from the list', () => {
    renderScreen();
    expect(screen.queryByRole('heading', { name: 'One World' })).toBeNull();
    expect(cardTitle('Splity')).toBeTruthy();
  });

  it('renders the coming-soon panel on the back of soon cards', () => {
    renderScreen();
    expect(backWebsiteLink()).toBeTruthy();
    expect(isFlipped()).toBe(false);
  });

  it('toggles the flip on click and never opens a modal', () => {
    renderScreen();
    fireEvent.click(cardTitle('Splity'));
    expect(isFlipped()).toBe(true);
    expect(screen.queryByText('Overview')).toBeNull();

    fireEvent.click(cardTitle('Splity'));
    expect(isFlipped()).toBe(false);
    expect(screen.queryByText('Overview')).toBeNull();
  });

  it('keeps the card flipped when the website link on the back is clicked', () => {
    renderScreen();
    fireEvent.click(cardTitle('Splity'));

    fireEvent.click(backWebsiteLink());
    expect(isFlipped()).toBe(true);
    expect(screen.queryByText('Overview')).toBeNull();
  });

  it('points the back website link at the project link', () => {
    renderScreen();
    expect(backWebsiteLink().getAttribute('href')).toBe(
      PROJECTS_EN.find((p) => p.id === 'splity')?.link
    );
  });

  it('flips the card instead of opening a modal for a deep-linked soon project', () => {
    window.location.hash = '#project-splity';
    renderScreen();
    expect(isFlipped()).toBe(true);
    expect(screen.queryByText('Overview')).toBeNull();
  });

  it('opens the regular detail modal for unmarked projects', () => {
    renderScreen();
    fireEvent.click(cardTitle('Termana'));
    expect(screen.getByText('Overview')).toBeTruthy();
  });
});
