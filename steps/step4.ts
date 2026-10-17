import { Column, createRenderer, type InputAction, Node, type Painter, type Renderer, Row, type Text, TextSlot } from 'tenfoot';
import { canvasText } from 'tenfoot/text/canvas';
import { createNav, type Nav, type Release } from 'tenfoot/ui';
import { type Demo, PLATE, RING, SANS, WHITE } from './demo.ts';

class Card extends Node {
  focused = false;
  override paint(p: Painter): void {
    p.rect(0, 0, this.w, this.h, PLATE, 12);
    if (this.focused) p.border(-3, -3, this.w + 6, this.h + 6, 3, RING, 15);
  }
}

class Label extends Node {
  private str: string;
  private text: Text;
  private slot = new TextSlot();
  private font = { family: SANS, size: 36, weight: 700 };
  constructor(text: Text, str: string) {
    super();
    this.text = text;
    this.str = str;
    this.w = text.measure(str, this.font);
    this.h = this.font.size * 1.25;
  }
  override paint(p: Painter): void {
    p.text(this.slot.get(this.text, this.str, this.font), 0, 0, WHITE);
  }
}

/** A heading and a row of cards, declared to the engine as one strip. */
function shelf(r: Renderer, nav: Nav, page: Column, id: string, title: string, w: number, h: number, n: number): Release {
  page.add(new Label(r.text, title));
  const rail = page.add(new Row({ gap: 24 }));
  const cards: Card[] = [];
  for (let i = 0; i < n; i++) {
    const card = rail.add(new Card());
    card.w = w;
    card.h = h;
    cards.push(card);
  }
  page.layout();
  return nav.strip({
    id: id,
    axis: 'x',
    scope: 'home',
    // The pack this row belongs to: Up and Down move between its rows structurally, and
    // land on the card under the one the viewer left rather than on a remembered index.
    pack: 'body',
    count: () => cards.length,
    item: (i) => id + '-' + i,
    label: (i) => title + ' ' + (i + 1),
    bounds: (i) => ({ x: page.x + rail.x + cards[i].x, y: page.y + rail.y + cards[i].y, w: cards[i].w, h: cards[i].h }),
    onFocus: (i) => {
      for (let k = 0; k < cards.length; k++) {
        cards[k].focused = k === i;
        r.scene.animate(cards[k], { scale: k === i ? 1.06 : 1 }, 150);
      }
      r.scene.invalidate();
    },
    onBlur: () => {
      for (let k = 0; k < cards.length; k++) {
        cards[k].focused = false;
        r.scene.animate(cards[k], { scale: 1 }, 150);
      }
    },
  });
}

export function run(canvas: HTMLCanvasElement): Demo {
  const nav = createNav();
  const r = createRenderer(canvas, { text: canvasText, focus: nav.host, speak: false });
  if (!r) throw new Error('WebGL unavailable');

  const page = r.root.add(new Column({ gap: 24 }));
  page.x = 96;
  page.y = 200;

  // The pack first, then the rows in it.
  const stacked = nav.pack({ id: 'body', axis: 'y', children: ['live', 'continue'] });
  const live = shelf(r, nav, page, 'live', 'Live & upcoming', 378, 212, 4);
  const cont = shelf(r, nav, page, 'continue', 'Continue watching', 302, 160, 5);
  nav.openScope({ id: 'home', initial: 'live-0' });

  const handle = (a: InputAction): boolean => (a === 'left' || a === 'right' || a === 'up' || a === 'down' ? nav.move(a) : false);
  return {
    renderer: r,
    handle: handle,
    status: () => 'focused ' + nav.current,
    dispose: () => {
      live();
      cont();
      stacked();
      r.scene.stop();
    },
  };
}
