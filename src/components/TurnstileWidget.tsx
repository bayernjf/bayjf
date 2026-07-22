import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
      }) => string;
      reset: (widgetId?: string) => void;
      remove?: (widgetId?: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  onToken: (token: string) => void;
  onError: () => void;
}

const SCRIPT_ID = 'cloudflare-turnstile-script';

export default function TurnstileWidget({ siteKey, onToken, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    const render = () => {
      if (!containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onToken,
        'expired-callback': onError,
        'error-callback': onError,
      });
    };

    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      if (window.turnstile) render();
      else existingScript.addEventListener('load', render, { once: true });
      return () => {
        existingScript.removeEventListener('load', render);
        if (widgetIdRef.current) {
          window.turnstile?.remove?.(widgetIdRef.current);
          widgetIdRef.current = undefined;
        }
      };
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', render, { once: true });
    document.head.appendChild(script);
    return () => {
      script.removeEventListener('load', render);
      if (widgetIdRef.current) {
        window.turnstile?.remove?.(widgetIdRef.current);
        widgetIdRef.current = undefined;
      }
    };
  }, [siteKey, onToken, onError]);

  return <div ref={containerRef} aria-label="Human verification" />;
}
