import { Bar, Button, Chip, LiveCard, Rail } from 'tenfoot/ui';
import type { Demo } from './demo.ts';
import { art, kit, settle, story, WIDE } from './kit.ts';

/**
 * The same widgets as the other stories, in another design: a warmer ground, an amber accent,
 * square corners and a thicker ring. The kit hands the theme to `theme()` once, before anything
 * is built, and every widget below reads the new values the same way it reads the old ones.
 */
export function run(canvas: HTMLCanvasElement, host: HTMLElement): Demo {
  const k = kit(canvas, host, {
    brand: { ground: '#14100c', accent: '#ffb000', live: '#ff3b6b', plate: '#221c16' },
    radius: { card: 2, poster: 2, control: 4, pill: 4 },
    focus: { ring: 5, scale: 1.06 },
    color: { text: { on: [1, 0.96, 0.9, 1] } },
  });
  const s = k.stage;

  const buttons = s.add(new Bar({ id: 'buttons' }));
  buttons.item('play', 'Play', new Button('Play', { kind: 'primary', icon: 'play' }));
  buttons.item('list', 'My List', new Button('My List', { icon: 'plus' }));
  buttons.item('more', 'More info', new Button('More info'));
  const chips = s.add(new Bar({ id: 'chips', gap: 12 }));
  const names = ['All', 'Live', 'Replays'];
  for (let i = 0; i < names.length; i++) chips.item('chip-' + i, names[i], new Chip(names[i], { selected: i === 0 }));

  const live = s.add(new Rail({ id: 'live', heading: 'Live now', viewport: WIDE }));
  for (let i = 0; i < 10; i++) {
    live.card('live-' + i, 'Match ' + (i + 1), new LiveCard({ art: art(i + 70, 280, 158), w: 280, h: 158, title: 'Match ' + (i + 1), meta: "1st half · 3" + i + "'", live: i < 2, progress: 0.3 + i * 0.08 }));
  }
  settle(s);

  const releases = [
    k.nav.pack({ id: 'body', axis: 'y', children: ['buttons', 'chips', 'live'] }),
    k.nav.strip(buttons.strip({ scope: 'story', pack: 'body' })),
    k.nav.strip(chips.strip({ scope: 'story', pack: 'body' })),
    k.nav.strip(live.strip({ scope: 'story', pack: 'body' })),
  ];
  k.nav.openScope({ id: 'story', initial: 'play' });
  return story(k, releases);
}
