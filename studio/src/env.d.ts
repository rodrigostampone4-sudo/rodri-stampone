declare module '*.css';

interface ImportMetaEnv {
  readonly SANITY_STUDIO_LANDING_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
