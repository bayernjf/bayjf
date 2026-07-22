/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_CLARITY_PROJECT_ID?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
