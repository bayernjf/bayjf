import { LanguageProvider } from '@/context/LanguageContext';
import { ToastProvider } from '@/context/ToastContext';
import App from '@/App';
import type { Language, ScreenKey } from '@/i18n/translations';
import type { ScreenType } from '@/types';

export default function SiteIsland({ lang, screen }: { lang: Language; screen: ScreenKey }) {
  return (
    <LanguageProvider initialLanguage={lang}>
      <ToastProvider>
        <App lang={lang} initialScreen={screen as ScreenType} />
      </ToastProvider>
    </LanguageProvider>
  );
}
