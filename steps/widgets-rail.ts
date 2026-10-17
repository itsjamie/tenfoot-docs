import { LiveCard, Rail } from 'tenfoot/ui';
import type { Demo } from './demo.ts';
import { art, kit, settle, story, WIDE } from './kit.ts';

/** Two rails in a pack: a heading over a row of cards that scrolls under it, and Down between them. */
export function run(canvas: HTMLCanvasElement, host: HTMLElement): Demo {
  const k = kit(canvas, host);
  const s = k.stage;

  const live = s.add(new Rail({ id: 'live', heading: 'Live now', seeAll: 'See all', viewport: WIDE }));
  for (let i = 0; i < 12; i++) {
    live.card('live-' + i, 'Match ' + (i + 1), new LiveCard({ art: art(i + 10, 280, 158), w: 280, h: 158, title: 'Match ' + (i + 1), meta: i < 3 ? "1st half · 2" + i + "'" : 'Starts at ' + (i + 4) + ' pm', live: i < 3, progress: i < 3 ? 0.2 + i * 0.15 : undefined }));
  }
  const more = s.add(new Rail({ id: 'more', heading: 'Documentaries', viewport: WIDE }));
  for (let i = 0; i < 14; i++) {
    more.card('more-' + i, 'Film ' + (i + 1), new LiveCard({ art: art(i + 30, 280, 158), w: 280, h: 158, title: 'Film ' + (i + 1), meta: 2010 + i + ' · 1h ' + (30 + i) + 'm', tag: i % 4 === 0 ? 'NEW' : undefined }));
  }
  settle(s);

  // A rail reads where its cards settled, so it is declared after layout.
  const releases = [
    k.nav.pack({ id: 'body', axis: 'y', children: ['live', 'more'] }),
    k.nav.strip(live.strip({ scope: 'story', pack: 'body' })),
    k.nav.strip(more.strip({ scope: 'story', pack: 'body' })),
  ];
  k.nav.openScope({ id: 'story', initial: 'live-0' });
  return story(k, releases);
}
