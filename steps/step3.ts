import { Column, createRenderer, type InputAction, Node, type Painter, Row, type Text, TextSlot } from 'tenfoot';
import { canvasText } from 'tenfoot/text/canvas';
import { createNav } from 'tenfoot/ui';
import { type Demo, PLATE, RING, SANS, WHITE } from './demo.ts';

// The focus ring is ordinary node state: the card knows it is focused and paints accordingly.
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

export function run(canvas: HTMLCanvasElement): Demo {
  // The app owns its focus engine and hands it to the renderer, which routes pointer input,
  // announcements and the diagnostics overlay through it.
  const nav = createNav();
  const r = createRenderer(canvas, { text: canvasText, focus: nav.host, speak: false });
  if (!r) throw new Error('WebGL unavailable');

  const page = r.root.add(new Column({ gap: 24 }));
  page.x = 96;
  page.y = 380;
  page.add(new Label(r.text, 'Continue watching'));
  const rail = page.add(new Row({ gap: 24 }));
  const cards: Card[] = [];
  for (let i = 0; i < 5; i++) {
    const card = rail.add(new Card());
    card.w = 320;
    card.h = 180;
    cards.push(card);
  }
  page.layout();

  // A strip is a row of focusables. The screen says where they are; the engine does the rest.
  const release = nav.strip({
    id: 'rail',
    axis: 'x',
    scope: 'home',
    count: () => cards.length,
    item: (i) => 'rail-' + i,
    label: (i) => 'Card ' + (i + 1),
    bounds: (i) => ({ x: page.x + rail.x + cards[i].x, y: page.y + rail.y + cards[i].y, w: cards[i].w, h: cards[i].h }),
    onFocus: (i) => {
      for (let k = 0; k < cards.length; k++) {
        const on = k === i;
        cards[k].focused = on;
        // A focused card rises a little: the scene tweens it and paints only while it moves.
        r.scene.animate(cards[k], { scale: on ? 1.06 : 1 }, 150);
      }
      r.scene.invalidate();
    },
  });
  // A scope confines focus to a screen and names where it lands.
  nav.openScope({ id: 'home', initial: 'rail-0' });

  const handle = (a: InputAction): boolean => (a === 'left' || a === 'right' || a === 'up' || a === 'down' ? nav.move(a) : false);
  return {
    renderer: r,
    handle: handle,
    status: () => 'focused ' + nav.current,
    dispose: () => {
      release();
      r.scene.stop();
    },
  };
}
