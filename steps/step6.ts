import { Column, createRenderer, FX_GRADE, type ImageHandle, type InputAction, Node, type Painter, type Renderer, Row, type Text, TextSlot } from 'tenfoot';
import { canvasText } from 'tenfoot/text/canvas';
import { createNav, type Release } from 'tenfoot/ui';
import { type Demo, DIM, PLATE, RING, SANS, WHITE } from './demo.ts';

/** A picture the page makes for itself: an SVG gradient as a data URL, which the plain resolver loads as any other image. */
function picture(i: number): string {
  const hue = (i * 47) % 360;
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="hsl(' + hue + ',60%,45%)"/><stop offset="1" stop-color="hsl(' + ((hue + 60) % 360) + ',70%,20%)"/>' +
    '</linearGradient></defs><rect width="320" height="180" fill="url(#g)"/></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

class Poster extends Node {
  focused = false;
  private key: string;
  private title: string;
  private meta: string;
  private blocked: boolean;
  private text: Text;
  private images: { get(key: string): ImageHandle };
  private titleSlot = new TextSlot();
  private metaSlot = new TextSlot();
  constructor(r: Renderer, key: string, title: string, meta: string, blocked: boolean) {
    super();
    this.text = r.text;
    this.images = r.images;
    this.key = key;
    this.title = title;
    this.meta = meta;
    this.blocked = blocked;
    this.w = 320;
    this.h = 250;
  }
  override paint(p: Painter): void {
    // An effect is a number in the quad, not a program switch: a graded card costs no draw call.
    if (this.blocked) p.pushEffect(FX_GRADE);
    p.rect(0, 0, this.w, 180, PLATE, 12);
    p.image(this.images.get(this.key), 0, 0, this.w, 180, 12);
    if (this.blocked) p.popEffect();
    if (this.focused) p.border(-3, -3, this.w + 6, 186, 3, RING, 15);
    p.text(this.titleSlot.get(this.text, this.title, { family: SANS, size: 24, weight: 700 }), 0, 196, WHITE);
    p.text(this.metaSlot.get(this.text, this.blocked ? 'Not available in your region' : this.meta, { family: SANS, size: 18, weight: 400 }), 0, 228, DIM);
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
  const nav = createNav();
  // The looks this app's cards can wear are named at creation and patched into the one shader.
  const r = createRenderer(canvas, { text: canvasText, focus: nav.host, speak: false, effects: ['grade'] });
  if (!r) throw new Error('WebGL unavailable');
  // Half a desaturation and a fifth off the light: grey enough to read as unplayable.
  r.gl.setEffect('grade', [0.85, 0.35, 0, 0]);

  const page = r.root.add(new Column({ gap: 20 }));
  page.x = 96;
  page.y = 120;
  const releases: Release[] = [nav.pack({ id: 'body', axis: 'y', children: ['live', 'films'] })];
  const rows: { id: string; title: string; blocked: number[] }[] = [
    { id: 'live', title: 'Live & upcoming', blocked: [1] },
    { id: 'films', title: 'Films', blocked: [0, 3] },
  ];
  for (let s = 0; s < rows.length; s++) {
    const row = rows[s];
    page.add(new Label(r.text, row.title));
    const rail = page.add(new Row({ gap: 24 }));
    const cards: Poster[] = [];
    for (let i = 0; i < 5; i++) {
      cards.push(rail.add(new Poster(r, picture(s * 5 + i), row.title + ' ' + (i + 1), 'Season 2 · 42m', row.blocked.indexOf(i) >= 0)));
    }
    page.layout();
    releases.push(
      nav.strip({
        id: row.id,
        axis: 'x',
        scope: 'home',
        pack: 'body',
        count: () => cards.length,
        item: (i) => row.id + '-' + i,
        label: (i) => row.title + ' ' + (i + 1),
        bounds: (i) => ({ x: page.x + rail.x + cards[i].x, y: page.y + rail.y + cards[i].y, w: cards[i].w, h: cards[i].h }),
        onFocus: (i) => {
          for (let k = 0; k < cards.length; k++) {
            cards[k].focused = k === i;
            r.scene.animate(cards[k], { scale: k === i ? 1.05 : 1 }, 150);
          }
          r.scene.invalidate();
        },
        onBlur: () => {
          for (let k = 0; k < cards.length; k++) {
            cards[k].focused = false;
            r.scene.animate(cards[k], { scale: 1 }, 150);
          }
        },
      }),
    );
  }
  nav.openScope({ id: 'home', initial: 'live-0' });

  return {
    renderer: r,
    handle: (a: InputAction) => (a === 'left' || a === 'right' || a === 'up' || a === 'down' ? nav.move(a) : false),
    status: () => 'focused ' + nav.current,
    dispose: () => {
      for (let i = 0; i < releases.length; i++) releases[i]();
      r.scene.stop();
    },
  };
}
