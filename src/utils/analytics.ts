declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const CLARITY_ID = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim();

function appendScript(id: string, src: string): void {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function initializeAnalytics(): void {
  if (GA_ID) {
    appendScript('google-analytics', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`);
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: false });
  }

  if (CLARITY_ID && !window.clarity) {
    window.clarity = (...args: unknown[]) => {
      const queue = (window.clarity as unknown as { q?: unknown[] }).q || [];
      queue.push(args);
      (window.clarity as unknown as { q: unknown[] }).q = queue;
    };
    appendScript('microsoft-clarity', `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`);
  }
}

export function trackPageView(pageName: string): void {
  const pagePath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (GA_ID && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pagePath,
      screen_name: pageName,
    });
  }
  if (CLARITY_ID && window.clarity) {
    window.clarity('set', 'screen', pageName);
  }
}

export function trackEvent(name: string, properties: Record<string, string | number | boolean> = {}): void {
  if (GA_ID && window.gtag) window.gtag('event', name, properties);
  if (CLARITY_ID && window.clarity) window.clarity('event', name);
}
