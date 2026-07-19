/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, ExperienceItem } from './types';

export const PROJECTS: Project[] = [
  {
    id: 'lumina-pay',
    title: 'Lumina Pay',
    category: 'FINTECH PLATFORM',
    description: 'A streamlined payment interface designed for creative professionals. Focuses on frictionless transactions with a calm, glassmorphic UI that prioritizes clarity over visual noise.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=800&q=80',
    tags: ['UI/UX', 'Glassmorphism', 'Web App', 'Fintech'],
    link: '#lumina-pay-case-study'
  },
  {
    id: 'aura-analytics',
    title: 'Aura Analytics',
    category: 'SAAS DASHBOARD',
    description: 'Transforming complex data sets into beautiful, readable environmental displays. The dashboard uses subtle tonal shifts instead of heavy shadows to indicate elevation.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    tags: ['Dashboard', 'Data Viz', 'SaaS', 'Systems Design'],
    link: '#aura-analytics-case-study'
  },
  {
    id: 'minimal-notes',
    title: 'Zen Workspace',
    category: 'PRODUCTIVITY TOOL',
    description: 'A distraction-free thinking and writing environment utilizing adaptive typographic scales and a contextual command menu.',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    tags: ['Interaction Design', 'Typography', 'SPA', 'Minimalism'],
    link: '#zen-workspace-case-study'
  },
  {
    id: 'aether-sound',
    title: 'Aether Sound',
    category: 'AUDIO INTERFACE',
    description: 'An interactive synthesiser and ambient generator designed to aid focus. It visually translates frequency spectrums into organic waveforms.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    tags: ['Audio Processing', 'Creative Coding', 'WebGL', 'UI/UX'],
    link: '#aether-sound-case-study'
  },
  {
    id: 'forma-studio',
    title: 'Forma Studio',
    category: 'SPATIAL TOOL',
    description: 'A lightweight 3D spatial editor for architects. Supports real-time collaborative drafting in virtual workspace environments with simple gesture controls.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    tags: ['3D Modeling', 'Spatial UI', 'Collaboration', 'Product Design'],
    link: '#forma-studio-case-study'
  },
  {
    id: 'komorebi-journal',
    title: 'Komorebi Journal',
    category: 'MOBILE UTILITY',
    description: 'A mindful daily journaling companion that captures mood patterns and aligns layout colors to match the ambient weather and natural daylight cycles.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    tags: ['React Native', 'Mobile UX', 'Health & Wellness', 'Micro-Interactions'],
    link: '#komorebi-journal-case-study'
  }
];

export const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    id: 'exp-1',
    role: 'Senior UX/UI Designer',
    company: 'Digital Craftsmanship Inc.',
    companyDescription: 'A premium digital agency focusing on custom-crafted branding, software interfaces, and visual systems for enterprise and startup clients.',
    location: 'San Francisco, CA (Hybrid)',
    period: '2021 - Present',
    bullets: [
      'Led design systems overhaul, improving development speed by 30%.',
      'Mentored junior designers and established design review processes.',
      'Designed core features for a flagship SaaS product reaching 1M+ users.'
    ]
  },
  {
    id: 'exp-2',
    role: 'Product Designer',
    company: 'TechNova Solutions',
    companyDescription: 'An agile technology product company specializing in scalable cloud applications, data analytics platforms, and workflow automation tools.',
    location: 'Austin, TX (Remote)',
    period: '2018 - 2021',
    bullets: [
      'Collaborated with cross-functional teams to launch 3 major product updates.',
      'Conducted user research resulting in a 25% increase in user retention.',
      'Created high-fidelity prototypes for stakeholder presentations.'
    ]
  },
  {
    id: 'exp-3',
    role: 'Junior Visual Designer',
    company: 'Creative Agency Co.',
    companyDescription: 'A boutique marketing and design house dedicated to crafting unique brand identities, interactive storytelling, and packaging design.',
    location: 'New York, NY',
    period: '2016 - 2018',
    bullets: [
      'Designed marketing collateral and branding materials for diverse clients.',
      'Assisted in website redesigns, focusing on mobile responsiveness.',
      'Developed custom iconography and illustration sets.'
    ]
  }
];
