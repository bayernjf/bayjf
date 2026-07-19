/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenType = 'home' | 'portfolio' | 'experience' | 'contact';

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  link?: string;
  year?: number;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  companyDescription?: string;
  location?: string;
  period: string;
  bullets: string[];
}
