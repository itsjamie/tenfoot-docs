import { Row } from 'tenfoot';
import { ArtTile, Bar, LiveCard, Poster, radius } from 'tenfoot/ui';
import type { Demo } from './demo.ts';
import { art, kit, settle, story } from './kit.ts';

/** The three card shapes: a poster with its caption under it, a wide card with its caption on it, and bare artwork. */
export function run(canvas: HTMLCanvasElement, host: HTMLElement): Demo {
  const k = kit(canvas, host);
  const s = k.stage;

  const posters = s.add(new Bar({ id: 'posters', gap: 24 }));
  posters.item('p0', 'Rivals', new Poster({ art: art(1, 160, 240), w: 160, h: 240, title: 'Rivals: the last derby', meta: 'Sat · 8 pm', badge: '4K' }));
  posters.item('p1', 'Football', new Poster({ art: art(2, 160, 240), w: 160, h: 240, overlay: 'Football' }));
  posters.item('p2', 'Overtime', new Poster({ art: art(3, 160, 240), w: 160, h: 240, title: 'Overtime', meta: 'Ep 4 · 42 min' }));
  posters.item('p3', 'Blocked', new Poster({ art: art(4, 160, 240), w: 160, h: 240, title: 'Kickoff Live', blocked: 'Not in your region' }));

  // Wide cards, and beside them bare artwork for a hero or a backdrop: no caption, no focus.
  const second = s.add(new Row({ gap: 20 }));
  const wide = second.add(new Bar({ id: 'wide', gap: 20 }));
  wide.item('w0', 'Derby day', new LiveCard({ art: art(5, 210, 118), w: 210, h: 118, title: 'Derby day', meta: "2nd half · 61'", live: true, progress: 0.62 }));
  wide.item('w1', 'Continue', new LiveCard({ art: art(6, 210, 118), w: 210, h: 118, title: 'The long season', meta: 'Ep 3 · 24 min left', progress: 0.4, corner: '4K' }));
  wide.item('w2', 'Reminder', new LiveCard({ art: art(7, 210, 118), w: 210, h: 118, title: 'Cup final', meta: 'Sunday · 3 pm', tag: 'REMINDER SET' }));
  second.add(new ArtTile(art(8, 190, 118), 190, 118, radius.card));
  settle(s);

  const releases = [
    k.nav.pack({ id: 'body', axis: 'y', children: ['posters', 'wide'] }),
    k.nav.strip(posters.strip({ scope: 'story', pack: 'body' })),
    k.nav.strip(wide.strip({ scope: 'story', pack: 'body' })),
  ];
  k.nav.openScope({ id: 'story', initial: 'p0' });
  return story(k, releases);
}
