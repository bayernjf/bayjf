/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  SlidersHorizontal, 
  Layers, 
  CalendarDays, 
  Grid, 
  ChevronDown, 
  Sparkles, 
  Folder, 
  BarChart3, 
  Tag, 
  Clock 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import BlurUpImage from './BlurUpImage';
import { useLanguage, Language } from '../context/LanguageContext';
import { Project } from '../types';
import ProjectDetailModal from './ProjectDetailModal';

export default function BayjfScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTagGroup, setSelectedTagGroup] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [displayMode, setDisplayMode] = useState<'grid' | 'timeline'>('grid');
  const [chartMetric, setChartMetric] = useState<'tech' | 'category'>('tech');
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const { t, projects, language, searchQuery } = useLanguage();

  // Sync active project with URL
  useEffect(() => {
    const checkProjectFromUrl = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get('project') || (hash.startsWith('#project-') ? hash.substring(9) : null);
      
      if (projectId) {
        const found = projects.find(p => p.id === projectId);
        if (found) {
          setActiveProject(found);
        } else {
          setActiveProject(null);
        }
      } else {
        setActiveProject(null);
      }
    };

    checkProjectFromUrl();
    window.addEventListener('hashchange', checkProjectFromUrl);
    return () => {
      window.removeEventListener('hashchange', checkProjectFromUrl);
    };
  }, [projects]);

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    window.location.hash = `project-${project.id}`;
  };

  const handleCloseProjectModal = () => {
    setActiveProject(null);
    if (window.location.hash.startsWith('#project-')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.has('project')) {
      params.delete('project');
      const searchStr = params.toString();
      const newUrl = window.location.pathname + (searchStr ? '?' + searchStr : '') + window.location.hash;
      history.replaceState(null, '', newUrl);
    }
  };

  // Categories
  const categories = ['All', 'AI Agent', 'Full-Stack', 'Browser Tools'];

  const categoryLabels: Record<Language, Record<string, string>> = {
    en: {
      'All': 'All Categories',
      'AI Agent': 'AI Agent',
      'Full-Stack': 'Full-Stack',
      'Browser Tools': 'Browser Tools'
    },
    zh: {
      'All': '所有类别',
      'AI Agent': 'AI Agent',
      'Full-Stack': '全栈开发',
      'Browser Tools': '浏览器工具'
    }
  };

  // Internal Translations for enhanced features
  const localTxt = {
    en: {
      summaryTitle: 'BayJF Overview',
      totalProjects: 'Total Projects',
      categoriesCount: 'Active Categories',
      latestYear: 'Latest Work',
      coreFocus: 'Primary Domain',
      techDistribution: 'Skills & Tech Stack',
      chartToggleTags: 'Technologies',
      chartToggleCats: 'Categories',
      scrollDown: 'Scroll to view projects',
      displayMode: 'Display Mode:',
      viewGrid: 'Grid Gallery',
      viewTimeline: 'Timeline',
      allTags: 'All Tags',
      designTag: 'Design',
      engTag: 'Engineering',
      fullstackTag: 'Full-Stack',
      projectsCount: 'projects',
      chronology: 'Chronology',
      viewDetails: 'VIEW DETAILS',
      filterTags: 'Filter by Tag Group'
    },
    zh: {
      summaryTitle: 'BayJF 概览',
      totalProjects: '项目总数',
      categoriesCount: '活跃类别',
      latestYear: '最新作品',
      coreFocus: '核心技术领域',
      techDistribution: '技术与栈分布',
      chartToggleTags: '技术栈',
      chartToggleCats: '项目类别',
      scrollDown: '向下滚动查看项目',
      displayMode: '显示模式：',
      viewGrid: '网格画廊',
      viewTimeline: '时间线模式',
      allTags: '所有标签',
      designTag: '设计',
      engTag: '工程',
      fullstackTag: '全栈',
      projectsCount: '个项目',
      chronology: '编年史',
      viewDetails: '查看详情',
      filterTags: '按标签组筛选'
    }
  }[language];



  // Map each project to a general filter category
  const getProjectFilterCategory = (project: Project) => {
    const tags = project.tags.map((t: string) => t.toLowerCase());
    if (
      tags.includes('creative coding') || 
      tags.includes('webgl') || 
      tags.includes('audio processing') ||
      tags.includes('código creativo') || 
      tags.includes('proceso audio')
    ) {
      return 'Creative Tech';
    }
    if (
      tags.includes('saas') || 
      tags.includes('dashboard') || 
      tags.includes('data viz') ||
      tags.includes('panel control') || 
      tags.includes('visualización')
    ) {
      return 'SaaS';
    }
    if (
      tags.includes('product design') || 
      tags.includes('spatial ui') || 
      tags.includes('minimalism') ||
      tags.includes('diseño producto') || 
      tags.includes('ui espacial') || 
      tags.includes('minimalismo')
    ) {
      return 'Product Design';
    }
    if (tags.some(tag => tag.includes('chrome') || tag.includes('manifest'))) return 'Browser Tools';
    if (tags.some(tag => tag.includes('spring') || tag.includes('supabase') || tag.includes('react'))) return 'Full-Stack';
    return 'AI Agent';
  };

  // Map projects to custom tag groups
  const matchesTagGroup = (project: Project, group: string) => {
    if (group === 'All') return true;
    const projectTags = project.tags.map(t => t.toLowerCase());
    
    if (group === 'Design') {
      const designKeywords = [
        'ui/ux', 'glassmorphism', 'efecto vidrio', 'interaction design', 
        'diseño interacción', 'typography', 'tipografía', 'minimalism', 
        'minimalismo', 'spatial ui', 'ui espacial', 'mobile ux', 'ux móvil', 
        'micro-interactions', 'microinteracciones'
      ];
      return projectTags.some(tag => designKeywords.includes(tag));
    }
    
    if (group === 'Engineering') {
      const engKeywords = [
        'web app', 'app web', 'fintech', 'dashboard', 'panel control', 
        'data viz', 'visualización', 'saas', 'systems design', 'diseño sistemas', 
        'audio processing', 'proceso audio', 'creative coding', 'código creativo', 
        'webgl', '3d modeling', 'modelado 3d', 'react native'
      ];
      return projectTags.some(tag => engKeywords.includes(tag));
    }
    
    if (group === 'Full-Stack') {
      const fsKeywords = [
        'saas', 'fintech', 'web app', 'app web', 'spatial ui', 
        'ui espacial', 'collaboration', 'colaboración', 'dashboard', 'panel control'
      ];
      return projectTags.some(tag => fsKeywords.includes(tag));
    }
    
    return true;
  };

  // Perform full dual-filter logic
  const filteredProjects = projects.filter(project => {
    // 1. Category filter
    const categoryMatches = selectedCategory === 'All' || getProjectFilterCategory(project) === selectedCategory;
    if (!categoryMatches) return false;

    // 2. Tag Group filter
    const tagGroupMatches = matchesTagGroup(project, selectedTagGroup);
    if (!tagGroupMatches) return false;

    // 3. Search Query
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const titleMatches = project.title.toLowerCase().includes(query);
    const tagsMatch = project.tags.some(tag => tag.toLowerCase().includes(query));
    return titleMatches || tagsMatch;
  });

  // Recharts Data Processing
  const processedChartData = (() => {
    if (chartMetric === 'tech') {
      // Top 6 technologies / tags frequency
      const tagCounts: Record<string, number> = {};
      projects.forEach(p => {
        p.tags.forEach(t => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      });
      return Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
    } else {
      // Category distribution count
      const catCounts: Record<string, number> = {};
      projects.forEach(p => {
        const cat = getProjectFilterCategory(p);
        const label = categoryLabels[language][cat] || cat;
        catCounts[label] = (catCounts[label] || 0) + 1;
      });
      return Object.entries(catCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    }
  })();

  // Sort project timeline list descending by year
  const timelineProjects = [...filteredProjects].sort((a, b) => {
    const yearA = a.year || 2024;
    const yearB = b.year || 2024;
    return yearB - yearA;
  });

  // Sync scroll listener and page overflow check
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    const checkOverflow = () => {
      const overflows = document.documentElement.scrollHeight > window.innerHeight;
      setIsOverflowing(overflows);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkOverflow);

    // Initial check with slight delay to ensure layouts are fully rendered
    checkOverflow();
    const timer = setTimeout(checkOverflow, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkOverflow);
      clearTimeout(timer);
    };
  }, [filteredProjects, displayMode]);

  // Monitor Dark Mode class for Recharts theming
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 45, scale: 0.96 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    },
    tap: {
      scale: 0.98,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    }
  };

  // Scroll smoothly to showcase grid/timeline anchor
  const handleScrollToGrid = () => {
    const anchor = document.getElementById('showcase-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen px-6 md:px-16 max-w-7xl mx-auto">
      {/* Title section with layout toggle in header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-[#e4e2e0]/40 dark:border-white/5 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="font-sans text-xs uppercase tracking-widest text-[#54615b] dark:text-[#bbcac2] font-bold flex items-center gap-2">
            <Layers size={14} /> {t('bayjf.headerTag')}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7] mt-3 tracking-tight">
            {t('bayjf.title')}
          </h1>
          <p className="font-sans text-base md:text-lg text-[#444748] dark:text-[#c4c7c7] mt-4 leading-relaxed">
            {t('bayjf.desc')}
          </p>
          <div className="w-24 h-1 bg-[#54615b] dark:bg-[#bbcac2] mt-6 animate-pulse" />
        </motion.div>

        {/* Layout Toggle in the Header */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col gap-2 items-start md:items-end"
        >
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#444748]/60 dark:text-[#c4c7c7]/60">
            {localTxt.displayMode}
          </span>
          <div className="flex bg-[#e4e2e0]/55 dark:bg-white/5 border border-[#e4e2e0]/40 dark:border-white/5 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setDisplayMode('grid')}
              id="header-display-mode-grid"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-sans font-semibold transition-all ${displayMode === 'grid' ? 'bg-white dark:bg-[#1b1c1b] text-[#1b1c1b] dark:text-white shadow-sm scale-[1.05]' : 'text-[#444748]/65 dark:text-[#c4c7c7]/65 hover:text-[#1b1c1b] dark:hover:text-[#fbf9f7]'}`}
            >
              <Grid size={13} />
              <span>{localTxt.viewGrid}</span>
            </button>
            <button
              onClick={() => setDisplayMode('timeline')}
              id="header-display-mode-timeline"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-sans font-semibold transition-all ${displayMode === 'timeline' ? 'bg-white dark:bg-[#1b1c1b] text-[#1b1c1b] dark:text-white shadow-sm scale-[1.05]' : 'text-[#444748]/65 dark:text-[#c4c7c7]/65 hover:text-[#1b1c1b] dark:hover:text-[#fbf9f7]'}`}
            >
              <CalendarDays size={13} />
              <span>{localTxt.viewTimeline}</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Subtle Scroll Down Indicator Anchor at the bottom of the header */}
      <AnimatePresence>
        {showScrollIndicator && isOverflowing && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.2 }}
            className="flex justify-center -mt-6 mb-10"
          >
            <button 
              onClick={handleScrollToGrid}
              className="flex flex-col items-center gap-1 text-[11px] text-[#54615b] dark:text-[#bbcac2] hover:text-[#1b1c1b] dark:hover:text-[#fbf9f7] font-semibold tracking-wider transition-colors cursor-pointer"
            >
              <span>{localTxt.scrollDown}</span>
              <ChevronDown size={14} className="animate-bounce" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Analytics Card with Recharts */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="w-full mb-16 p-6 md:p-8 rounded-3xl bg-[#fbf9f7] dark:bg-[#161716] border border-[#e4e2e0] dark:border-white/5 shadow-md flex flex-col lg:flex-row gap-8 items-stretch overflow-hidden"
      >
        {/* Analytics Metadata Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-[#54615b]/10 dark:bg-white/5 text-[#54615b] dark:text-[#bbcac2]">
                <BarChart3 size={16} />
              </span>
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7]">
                {localTxt.summaryTitle}
              </h2>
            </div>
            <p className="font-sans text-xs md:text-sm text-[#444748]/75 dark:text-[#c4c7c7]/70 leading-relaxed mb-6">
              {language === 'en'
                ? 'Synthesized metrics revealing distribution profiles, stack specialization, and digital output chronologies.'
                : 'Métricas sintetizadas que revelan perfiles de distribución, especialización tecnológica y cronología.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 md:mb-0">
            <div className="p-4 rounded-2xl bg-[#e4e2e0]/20 dark:bg-white/5 border border-[#e4e2e0]/45 dark:border-white/5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#444748]/60 dark:text-[#c4c7c7]/60 block mb-1">
                {localTxt.totalProjects}
              </span>
              <span className="font-serif text-3xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7]">
                {projects.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#e4e2e0]/20 dark:bg-white/5 border border-[#e4e2e0]/45 dark:border-white/5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#444748]/60 dark:text-[#c4c7c7]/60 block mb-1">
                {localTxt.categoriesCount}
              </span>
              <span className="font-serif text-3xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7]">
                {categories.length - 1}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#e4e2e0]/20 dark:bg-white/5 border border-[#e4e2e0]/45 dark:border-white/5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#444748]/60 dark:text-[#c4c7c7]/60 block mb-1">
                {localTxt.latestYear}
              </span>
              <span className="font-serif text-3xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7]">
                2026
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#e4e2e0]/20 dark:bg-white/5 border border-[#e4e2e0]/45 dark:border-white/5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#444748]/60 dark:text-[#c4c7c7]/60 block mb-1">
                {localTxt.coreFocus}
              </span>
              <span className="font-sans text-xs font-bold text-[#54615b] dark:text-[#bbcac2] block mt-1 uppercase tracking-widest leading-none">
                {language === 'en' ? 'AI Agent & Full-Stack' : 'AI Agent 与全栈开发'}
              </span>
            </div>
          </div>
        </div>

        {/* Visualized Recharts Graph */}
        <div className="flex-1 min-h-[220px] bg-[#e4e2e0]/20 dark:bg-black/20 border border-[#e4e2e0]/60 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-[#e4e2e0]/50 dark:border-white/5 pb-2">
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#1b1c1b] dark:text-[#fbf9f7]">
              {localTxt.techDistribution}
            </span>
            
            {/* Custom Interactive Toggle Inside Card */}
            <div className="flex bg-[#e4e2e0]/60 dark:bg-white/10 p-0.5 rounded-lg text-[10px] font-sans font-semibold">
              <button
                onClick={() => setChartMetric('tech')}
                className={`px-2 py-1 rounded-md transition-colors ${chartMetric === 'tech' ? 'bg-[#1b1c1b] dark:bg-[#fbf9f7] text-[#fbf9f7] dark:text-[#1b1c1b]' : 'text-[#444748]/70 dark:text-[#c4c7c7]/70'}`}
              >
                {localTxt.chartToggleTags}
              </button>
              <button
                onClick={() => setChartMetric('category')}
                className={`px-2 py-1 rounded-md transition-colors ${chartMetric === 'category' ? 'bg-[#1b1c1b] dark:bg-[#fbf9f7] text-[#fbf9f7] dark:text-[#1b1c1b]' : 'text-[#444748]/70 dark:text-[#c4c7c7]/70'}`}
              >
                {localTxt.chartToggleCats}
              </button>
            </div>
          </div>

          {/* Recharts Component */}
          <div className="w-full h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: isDark ? '#c4c7c7' : '#444748', fontSize: 9, fontFamily: 'monospace' }} 
                  axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: isDark ? '#c4c7c7' : '#444748', fontSize: 9 }} 
                  axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                  contentStyle={{
                    backgroundColor: isDark ? '#1a1b1a' : '#f5f3f1',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontFamily: 'sans-serif'
                  }}
                  itemStyle={{ color: isDark ? '#fbf9f7' : '#1b1c1b' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                  {processedChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isDark ? '#bbcac2' : '#54615b'} 
                      fillOpacity={0.85 - (index * 0.08)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>



      {/* Grid Showcase anchor */}
      <div id="showcase-anchor" className="scroll-mt-28" />

      {/* Primary Category Filter Menu */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-6 border-b border-[#e4e2e0]/40 dark:border-white/5 pb-6"
      >
        <span className="font-sans text-xs uppercase tracking-wider text-[#444748]/60 dark:text-[#c4c7c7]/60 mr-2 flex items-center gap-1.5 font-semibold">
          <SlidersHorizontal size={12} /> {t('bayjf.filter')}
        </span>
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              id={`filter-btn-${category.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => {
                setSelectedCategory(category);
                setSelectedTagGroup('All'); // Reset tag filter on category change
              }}
              className={`interactive px-4 py-2 rounded-full font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-[#1b1c1b] dark:bg-[#fbf9f7] text-[#fbf9f7] dark:text-[#1b1c1b] scale-105 shadow-md'
                  : 'bg-[#e4e2e0]/30 dark:bg-white/5 text-[#444748] dark:text-[#c4c7c7] hover:bg-[#e4e2e0]/70 dark:hover:bg-white/10'
              }`}
            >
              {categoryLabels[language][category] || category}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Navigation Bar to Filter Project Cards by specific Tag Groups */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#e4e2e0]/15 dark:bg-white/5 rounded-2xl p-4 border border-[#e4e2e0]/30 dark:border-white/5"
      >
        {/* Left: Tag filter tabs */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#444748]/50 dark:text-[#c4c7c7]/50 flex items-center gap-1">
            <Tag size={10} /> {localTxt.filterTags}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'All', label: localTxt.allTags },
              { id: 'Design', label: localTxt.designTag },
              { id: 'Engineering', label: localTxt.engTag },
              { id: 'Full-Stack', label: localTxt.fullstackTag }
            ].map(group => {
              const isActive = selectedTagGroup === group.id;
              return (
                <button
                  key={group.id}
                  id={`tag-group-${group.id.toLowerCase()}`}
                  onClick={() => setSelectedTagGroup(group.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium tracking-wide transition-all ${
                    isActive 
                      ? 'bg-[#54615b] dark:bg-[#bbcac2] text-white dark:text-[#1b1c1b] shadow-sm scale-[1.02]' 
                      : 'bg-transparent text-[#444748] dark:text-[#c4c7c7] hover:bg-[#e4e2e0]/40 dark:hover:bg-white/5'
                  }`}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Display mode toggle & Project counter */}
        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-[#e4e2e0]/30 pt-3 md:pt-0">
          <div className="text-right">
            <span className="font-serif text-sm font-bold text-[#1b1c1b] dark:text-[#fbf9f7] block leading-none">
              {filteredProjects.length}
            </span>
            <span className="font-sans text-[10px] uppercase tracking-wider text-[#444748]/55 dark:text-[#c4c7c7]/55">
              {localTxt.projectsCount}
            </span>
          </div>

          {/* Premium capsule view toggle selector */}
          <div className="flex bg-[#e4e2e0]/55 dark:bg-white/5 border border-[#e4e2e0]/40 dark:border-white/5 p-1 rounded-xl">
            <button
              onClick={() => setDisplayMode('grid')}
              id="display-mode-grid"
              aria-label={localTxt.viewGrid}
              title={localTxt.viewGrid}
              className={`p-2 rounded-lg transition-all ${displayMode === 'grid' ? 'bg-white dark:bg-[#1b1c1b] text-[#1b1c1b] dark:text-white shadow-sm scale-[1.05]' : 'text-[#444748]/50 dark:text-[#c4c7c7]/50 hover:text-[#1b1c1b]'}`}
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setDisplayMode('timeline')}
              id="display-mode-timeline"
              aria-label={localTxt.viewTimeline}
              title={localTxt.viewTimeline}
              className={`p-2 rounded-lg transition-all ${displayMode === 'timeline' ? 'bg-white dark:bg-[#1b1c1b] text-[#1b1c1b] dark:text-white shadow-sm scale-[1.05]' : 'text-[#444748]/50 dark:text-[#c4c7c7]/50 hover:text-[#1b1c1b]'}`}
            >
              <CalendarDays size={15} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Projects Grid Container / Chronological Timeline */}
      {filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 bg-[#e4e2e0]/10 dark:bg-white/5 rounded-3xl border border-dashed border-[#e4e2e0] dark:border-white/5 px-6"
        >
          <p className="font-serif text-2xl text-[#444748]/80 dark:text-[#c4c7c7]/80">
            {language === 'en' ? 'No projects match your criteria' : 'Ningún proyecto coincide con tus criterios'}
          </p>
          <p className="font-sans text-sm text-[#444748]/50 dark:text-[#c4c7c7]/50 mt-2 max-w-md mx-auto">
            {language === 'en' 
              ? 'Try resetting the filters or searching for AI Agent, Full-Stack, Chrome Extension, or Supabase.'
              : '可以重置筛选，或搜索 AI Agent、全栈开发、Chrome 扩展、Supabase 等标签。'}
          </p>
        </motion.div>
      ) : displayMode === 'grid' ? (
        // Standard Grid View with Layout Animations
        <motion.div 
          layout 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                layout
                key={project.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 32,
                  layout: { type: 'spring', stiffness: 350, damping: 32 }
                }}
                onClick={() => handleSelectProject(project)}
                className="group flex flex-col h-full bg-[#fbf9f7] dark:bg-[#161716] rounded-2xl border border-[#e4e2e0] dark:border-white/5 shadow-md hover:shadow-xl hover:border-[#54615b]/20 dark:hover:border-white/10 transition-[border-color,box-shadow,background-color] duration-300 overflow-hidden cursor-pointer"
              >
                {/* Hover-effect thumbnail container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#f5f3f1] dark:bg-[#1a1b1a] border-b border-[#e4e2e0] dark:border-white/5">
                  <BlurUpImage
                    src={project.image}
                    alt={project.title}
                    className="transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-1"
                  />
                  
                  {/* Visual Glassmorphic Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <div className="text-[#fbf9f7] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="font-sans text-[10px] font-bold tracking-widest uppercase bg-[#bbcac2]/80 backdrop-blur-md text-[#1b1c1b] px-2 py-1 rounded">
                        {project.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-col flex-grow p-6 md:p-8">
                  {/* Category tag */}
                  <span className="font-sans text-[10px] font-bold tracking-widest text-[#54615b] dark:text-[#bbcac2] mb-2 uppercase flex items-center justify-between">
                    <span>{project.category}</span>
                    {project.year && (
                      <span className="font-mono text-xs text-[#444748]/50 dark:text-[#c4c7c7]/50 font-semibold">{project.year}</span>
                    )}
                  </span>

                  {/* Project Title */}
                  <h3 className="font-serif text-2xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7] mb-3 group-hover:text-[#54615b] dark:group-hover:text-[#bbcac2] transition-colors duration-300">
                    {project.title}
                  </h3>

                  {/* Short Description */}
                  <p className="font-sans text-sm text-[#444748] dark:text-[#c4c7c7] mb-6 line-clamp-3 leading-relaxed flex-grow">
                    {project.description}
                  </p>

                  {/* Sub-tags list */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="font-sans text-[11px] bg-[#e4e2e0]/40 dark:bg-white/5 text-[#444748] dark:text-[#c4c7c7] px-2.5 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="font-sans text-[10px] text-[#444748]/50 dark:text-[#c4c7c7]/50 self-center pl-1 font-semibold">
                        +{project.tags.length - 3} {t('bayjf.more')}
                      </span>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="pt-4 border-t border-[#e4e2e0]/40 dark:border-white/5">
                    <button
                      id={`view-project-${project.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProject(project);
                      }}
                      className="interactive inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#1b1c1b] dark:text-[#fbf9f7] hover:text-[#54615b] dark:hover:text-[#bbcac2] transition-colors group/link focus:outline-none"
                    >
                      {t('bayjf.viewCaseStudy')}
                      <ArrowRight 
                        size={14} 
                        className="transform group-hover/link:translate-x-1.5 transition-transform duration-300" 
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        // Chronological Interactive Timeline View
        <div className="timeline-container relative mt-8 flex flex-col space-y-16">
          {/* Vertical axis line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-[#e4e2e0] dark:border-white/10 transform md:-translate-x-1/2" />

          <AnimatePresence mode="popLayout">
            {timelineProjects.map((project, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  layout
                  key={`timeline-${project.id}`}
                  initial={{ opacity: 0, x: isEven ? -60 : 60, y: 30 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  transition={{ duration: 0.7, ease: [0.215, 0.610, 0.355, 1.000] }}
                  className={`timeline-item relative w-full md:w-[calc(50%-2rem)] flex flex-col ${
                    isEven ? 'md:self-start md:pr-8' : 'md:self-end md:pl-8'
                  } pl-12 md:pl-0`}
                >
                  {/* Decorative connecting lines (connector physically connecting marker to card) */}
                  {/* Mobile connector: from marker to card */}
                  <div className="absolute left-4 md:hidden top-1/2 -translate-y-1/2 w-8 h-0.5 bg-[#e4e2e0] dark:bg-white/10 z-0" />
                  
                  {/* Desktop connector: from center timeline line to card */}
                  {isEven ? (
                    <div className="hidden md:block absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-0.5 bg-[#e4e2e0] dark:bg-white/10 z-0" />
                  ) : (
                    <div className="hidden md:block absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-0.5 bg-[#e4e2e0] dark:bg-white/10 z-0" />
                  )}

                  {/* Centered Timeline Node Circle with Year */}
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1b1c1b] dark:bg-[#fbf9f7] text-[#fbf9f7] dark:text-[#1b1c1b] border-4 border-[#e4e2e0]/60 dark:border-white/10 flex items-center justify-center transform -translate-x-1/2 md:translate-x-0 font-mono text-[10px] font-bold z-10 shadow-sm ${
                    isEven ? 'md:left-auto md:right-0 md:-right-12' : 'md:left-0 md:-left-12'
                  }`}>
                    {project.year || 2024}
                  </div>

                  {/* Card Content */}
                  <div 
                    onClick={() => handleSelectProject(project)}
                    className="w-full bg-[#fbf9f7] dark:bg-[#161716] border border-[#e4e2e0] dark:border-white/5 rounded-2xl shadow-md p-6 hover:shadow-xl hover:border-[#54615b]/20 dark:hover:border-white/10 transition-all duration-300 flex flex-col md:flex-row gap-6 cursor-pointer group relative z-10"
                  >
                    <div className="w-full md:w-2/5 aspect-[16/11] rounded-xl overflow-hidden bg-[#e4e2e0]/20 flex-shrink-0">
                      <BlurUpImage src={project.image} alt={project.title} className="transition-transform duration-700 ease-out group-hover:scale-105" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-sans text-[9px] font-bold bg-[#54615b]/10 dark:bg-white/5 text-[#54615b] dark:text-[#bbcac2] px-2 py-0.5 rounded">
                            {project.category}
                          </span>
                          <span className="font-mono text-[10px] text-[#444748]/50 dark:text-[#c4c7c7]/50 font-bold flex items-center gap-1">
                            <Clock size={10} /> {project.year || 2024}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7] mb-2 group-hover:text-[#54615b] dark:group-hover:text-[#bbcac2] transition-colors">
                          {project.title}
                        </h3>
                        <p className="font-sans text-xs text-[#444748] dark:text-[#c4c7c7] line-clamp-2 mb-4 leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[#e4e2e0]/40 dark:border-white/5">
                        <div className="flex gap-1">
                          {project.tags.slice(0, 2).map(t => (
                            <span key={t} className="font-sans text-[10px] bg-[#e4e2e0]/40 dark:bg-white/5 px-2 py-0.5 rounded text-[#444748] dark:text-[#c4c7c7]">{t}</span>
                          ))}
                        </div>
                        <button className="text-[10px] font-bold tracking-widest text-[#1b1c1b] dark:text-[#fbf9f7] inline-flex items-center gap-1 group/btn">
                          {localTxt.viewDetails} <ArrowRight size={10} className="transform group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modern Expandable Case Study Modal */}
      <AnimatePresence>
        {activeProject && (
          <ProjectDetailModal
            project={activeProject}
            onClose={handleCloseProjectModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
