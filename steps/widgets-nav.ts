import { Node, Row } from 'tenfoot';
import { Badge, color, FocusRow, Label, List, NavRail, type as t } from 'tenfoot/ui';
import type { Demo } from './demo.ts';
import { kit, settle, story, WIDE } from './kit.ts';

/** A left nav beside a list: two vertical strips, and Left and Right cross between them. */
export function run(canvas: HTMLCanvasElement, host: HTMLElement): Demo {
  const k = kit(canvas, host);
  const s = k.stage;
  const side = s.add(new Row({ gap: 40, align: 'start' }));

  const sections = ['Home', 'Live', 'Sports', 'My List', 'Settings'];
  const rail = side.add(new NavRail({ id: 'nav', items: sections, selected: 0, width: 220 }));

  const list = side.add(new List({ id: 'list', width: WIDE - 220 - 40 }));
  for (let i = 0; i < 6; i++) {
    const row = new FocusRow({ width: WIDE - 220 - 40, gap: 20, padding: { left: 20, right: 20, top: 14, bottom: 14 }, align: 'center' });
    const num = row.add(new Label(String(i + 1).padStart(2, '0'), t.eyebrow, color.text.body));
    num.w = 40;
    row.add(new Label('Episode ' + (i + 1) + ': ' + ['Kickoff', 'The derby', 'Away days', 'The cup', 'Injury time', 'The last game'][i], t.cardTitle));
    const grow = row.add(new Node());
    grow.grow = 1;
    row.add(new Badge(i < 2 ? 'Watched' : (42 + i) + ' min'));
    list.row('ep-' + i, 'Episode ' + (i + 1), row);
  }
  settle(s);

  // Choosing a section is separate from focusing it: OK on the nav selects, arrows only move.
  let navAt = -1;
  const releases = [
    k.nav.strip(rail.strip({ scope: 'story', onFocus: (i) => (navAt = i), onBlur: () => (navAt = -1) })),
    k.nav.strip(list.strip({ scope: 'story' })),
  ];
  k.nav.openScope({ id: 'story', initial: 'nav-0' });
  return story(k, releases, () => {
    if (navAt >= 0) rail.select(navAt);
  });
}
