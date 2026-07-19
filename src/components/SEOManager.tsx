/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface SEOManagerProps {
  currentScreen: string;
}

export default function SEOManager({ currentScreen }: SEOManagerProps) {
  const { t, language } = useLanguage();

  useEffect(() => {
    // 1. Get localized title and description
    const titleKey = `seo.${currentScreen}.title`;
    const descKey = `seo.${currentScreen}.desc`;

    const pageTitle = t(titleKey);
    const pageDescription = t(descKey);

    // 2. Set page title
    document.title = pageTitle;

    // 3. Set HTML lang attribute for accessibility (a11y)
    document.documentElement.setAttribute('lang', language);

    // Helper to find or create meta tags
    const setMetaTag = (attributeName: string, attributeValue: string, contentValue: string, isProperty: boolean = false) => {
      const selector = isProperty 
        ? `meta[property="${attributeValue}"]` 
        : `meta[name="${attributeValue}"]`;
      
      let metaElement = document.querySelector(selector);
      
      if (!metaElement) {
        metaElement = document.createElement('meta');
        if (isProperty) {
          metaElement.setAttribute('property', attributeValue);
        } else {
          metaElement.setAttribute('name', attributeValue);
        }
        document.head.appendChild(metaElement);
      }
      
      metaElement.setAttribute('content', contentValue);
    };

    // 4. Update core meta tags
    setMetaTag('name', 'description', pageDescription);

    // 5. Update OpenGraph tags for better social media share representation (SEO)
    setMetaTag('property', 'og:title', pageTitle, true);
    setMetaTag('property', 'og:description', pageDescription, true);
    setMetaTag('property', 'og:type', 'website', true);
    setMetaTag('property', 'og:url', window.location.href, true);

    // 6. Update Twitter Card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', pageDescription);

  }, [currentScreen, language, t]);

  // This is a headless utility component that manages head metadata
  return null;
}
