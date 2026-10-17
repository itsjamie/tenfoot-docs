import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

const REPO = 'https://github.com/itsjamie/tenfoot-docs';

/**
 * The documentation site: Starlight on Astro, built static for GitHub Pages at
 * itsjamie.github.io/tenfoot-docs. The live demos import `tenfoot` from node_modules, so what a
 * reader sees running is the package as published. TENFOOT_SRC points them at a checkout of the
 * library instead, through the alias table its own apps use, for writing docs ahead of a release.
 */
const src = process.env.TENFOOT_SRC;
const alias = src ? (await import(src.replace(/\/?$/, '/vite.config.ts'))).libraryAlias : [];

export default defineConfig({
  site: 'https://itsjamie.github.io',
  base: '/tenfoot-docs',
  outDir: './dist',
  integrations: [
    starlight({
      title: 'Tenfoot',
      description:
        'A WebGL UI renderer for set-top boxes and smart TVs: WebGL 1 on 2017 webOS and Tizen sets, directional focus, captions on the media clock, compressed textures, and a widget kit.',
      social: [
        { icon: 'npm', label: 'npm', href: 'https://www.npmjs.com/package/tenfoot' },
        { icon: 'github', label: 'GitHub', href: REPO },
      ],
      editLink: { baseUrl: REPO + '/edit/main/' },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        { label: 'Start here', items: [{ slug: 'why' }, { slug: 'install' }] },
        { label: 'Build an app', items: [{ autogenerate: { directory: 'tutorial' } }] },
        { label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
        { label: 'Beyond the tutorial', items: [{ slug: 'reference-app' }, { slug: 'ship' }, { slug: 'roadmap' }] },
      ],
    }),
  ],
  vite: { resolve: { alias: alias } },
});
