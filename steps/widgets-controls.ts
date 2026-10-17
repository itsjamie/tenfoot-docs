import { Bar, Button, Chip, Pill } from 'tenfoot/ui';
import type { Demo } from './demo.ts';
import { kit, settle, story } from './kit.ts';

/** Buttons at the design's three weights, filter chips, and pills: three bars stacked in a pack. */
export function run(canvas: HTMLCanvasElement, host: HTMLElement): Demo {
  const k = kit(canvas, host);
  const s = k.stage;

  const buttons = s.add(new Bar({ id: 'buttons' }));
  buttons.item('play', 'Play', new Button('Play', { kind: 'primary', icon: 'play' }));
  buttons.item('list', 'My List', new Button('My List', { icon: 'plus' }));
  buttons.item('more', 'More info', new Button('More info'));
  buttons.item('settings', 'Settings', new Button('Settings', { kind: 'quiet' }));

  const names = ['All', 'Live', 'Replays', 'Highlights', 'Interviews'];
  const chipNodes = names.map((name, i) => new Chip(name, { selected: i === 0 }));
  const chips = s.add(new Bar({ id: 'chips', gap: 12 }));
  for (let i = 0; i < names.length; i++) chips.item('chip-' + i, names[i], chipNodes[i]);

  const pills = s.add(new Bar({ id: 'pills', gap: 16 }));
  pills.item('en', 'English', new Pill('English'));
  pills.item('fr', 'Français', new Pill('Français'));
  pills.item('off', 'Off', new Pill('Off'));
  settle(s);

  // A chip is chosen with OK; focus and selection are separate states, as they are in the design.
  let chipAt = -1;
  const releases = [
    k.nav.pack({ id: 'body', axis: 'y', children: ['buttons', 'chips', 'pills'] }),
    k.nav.strip(buttons.strip({ scope: 'story', pack: 'body' })),
    k.nav.strip(chips.strip({ scope: 'story', pack: 'body', onFocus: (i) => (chipAt = i), onBlur: () => (chipAt = -1) })),
    k.nav.strip(pills.strip({ scope: 'story', pack: 'body' })),
  ];
  k.nav.openScope({ id: 'story', initial: 'play' });
  return story(k, releases, () => {
    if (chipAt < 0) return;
    for (let i = 0; i < chipNodes.length; i++) chipNodes[i].select(i === chipAt);
    k.r.scene.invalidate();
  });
}
