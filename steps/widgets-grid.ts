import { CardGrid, Label, Poster, type as t } from 'tenfoot/ui';
import type { Demo } from './demo.ts';
import { art, kit, settle, story, WIDE } from './kit.ts';

/** A fixed-column field of posters. It fills the screen from where it sits, and rows past the bottom scroll up. */
export function run(canvas: HTMLCanvasElement, host: HTMLElement): Demo {
  const k = kit(canvas, host);
  const s = k.stage;
  s.add(new Label('Football', t.heading));
  const grid = s.add(new CardGrid({ id: 'grid', columns: 5, width: WIDE, gap: { x: 20, y: 28 } }));
  for (let i = 0; i < 25; i++) {
    grid.card('grid-' + i, 'Title ' + (i + 1), new Poster({ art: art(i + 50, 160, 240), w: 160, h: 240, title: 'Title ' + (i + 1), meta: (i % 3 === 0 ? 'Live' : 'Replay') + ' · ' + (60 + i) + ' min' }));
  }
  settle(s);
  const releases = [k.nav.grid(grid.cells({ scope: 'story' }))];
  k.nav.openScope({ id: 'story', initial: 'grid-0' });
  return story(k, releases);
}
