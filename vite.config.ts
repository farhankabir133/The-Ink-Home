import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    const normalizeBasePath = (value: string | undefined): string => {
      if (!value || !value.trim()) {
        return mode === 'production' ? '/The-Ink-Home/' : '/';
      }
      const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
      return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
    };

    return {
      base: normalizeBasePath(env.VITE_BASE_PATH),
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
