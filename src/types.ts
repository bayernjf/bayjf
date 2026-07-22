/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenType = 'home' | 'bayjf' | 'experience' | 'contact';

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  link?: string;
  year?: number;
  date?: string;
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
