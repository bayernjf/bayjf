import { useEffect } from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import { ToastProvider } from '@/context/ToastContext';
import App from '@/App';
import type { Language, ScreenKey } from '@/i18n/translations';
import type { ScreenType } from '@/types';

export default function SiteIsland({ lang, screen }: { lang: Language; screen: ScreenKey }) {
  // 标记 hydrate 完成，便于 e2e 等待交互就绪，也可用于抑制 hydrate 前的交互闪烁。
  useEffect(() => {
    document.documentElement.setAttribute('data-app-hydrated', 'true');
  }, []);

  return (
    <LanguageProvider initialLanguage={lang}>
      <ToastProvider>
        <App lang={lang} initialScreen={screen as ScreenType} />
      </ToastProvider>
    </LanguageProvider>
  );
}
