import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';

/**
 * Every television this targets is older than any browser that runs module scripts, so ES5 is the
 * only output: one bundle, lowered by Babel against `chrome 38`, loaded through SystemJS. The
 * source stays modern TypeScript. Nothing here is special to the library; it is the build any
 * 2017-set application needs.
 */
export default defineConfig({
  base: './',
  build: { outDir: 'dist', emptyOutDir: true },
  plugins: [legacy({ targets: ['chrome 38'], renderModernChunks: false, modernPolyfills: false })],
});
