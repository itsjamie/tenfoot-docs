import { Row } from 'tenfoot';
import { Badge, color, Label, MarkedLine, MetaLine, Paragraph, TrackedLabel, type as t } from 'tenfoot/ui';
import type { Demo } from './demo.ts';
import { kit, settle, story, WIDE } from './kit.ts';

/** Every way the design sets a line of type, at the sizes the design states. Nothing here takes focus. */
export function run(canvas: HTMLCanvasElement, host: HTMLElement): Demo {
  const k = kit(canvas, host);
  const s = k.stage;
  s.add(new TrackedLabel('SATURDAY · FINAL', t.eyebrow, 0.16, color.text.body));
  s.add(new Label('Rivals: the last derby', t.screenTitle));
  s.add(new MetaLine(['2026', '1h 52m', 'Documentary', { badge: 'PG' }, { accent: '96% match' }]));
  s.add(
    new Paragraph(
      'Two clubs, one city, and a season that came down to ninety minutes. The players, the fans and the people who keep the lights on tell the story of the year the rivalry stopped being a game.',
      { font: t.synopsis, width: WIDE, color: color.text.body },
    ),
  );
  s.add(new Label('A heading over a rail', t.heading));
  s.add(new MarkedLine('Press ● to play the next episode', t.metaLine));
  const badges = s.add(new Row({ gap: 12, align: 'center' }));
  badges.add(new Badge('4K'));
  badges.add(new Badge('Dolby Vision'));
  badges.add(new Badge('PG'));
  badges.add(new Badge('LIVE', { kind: 'live' }));
  badges.add(new Badge('Up next · 4K', { kind: 'onArt' }));
  settle(s);
  return story(k, []);
}
