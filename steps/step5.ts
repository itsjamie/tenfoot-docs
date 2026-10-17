import { Column, createRenderer, createRouter, type InputAction, Node, type Painter, type Renderer, type Route, Row, type Text, TextSlot } from 'tenfoot';
import { canvasText } from 'tenfoot/text/canvas';
import { createNav, type Nav } from 'tenfoot/ui';
import { type Demo, DIM, PLATE, RING, SANS, WHITE } from './demo.ts';

class Card extends Node {
  focused = false;
  override paint(p: Painter): void {
    p.rect(0, 0, this.w, this.h, PLATE, 12);
    if (this.focused) p.border(-3, -3, this.w + 6, this.h + 6, 3, RING, 15);
  }
}

class Label extends Node {
  str: string;
  private text: Text;
  private slot = new TextSlot();
  private font: { family: string; size: number; weight: number };
  private color: number[];
  constructor(text: Text, str: string, size = 36, color = WHITE) {
    super();
    this.text = text;
    this.str = str;
    this.color = color;
    this.font = { family: SANS, size: size, weight: 700 };
    this.w = text.measure(str, this.font);
    this.h = size * 1.25;
  }
  override paint(p: Painter): void {
    p.text(this.slot.get(this.text, this.str, this.font), 0, 0, this.color);
  }
}

/** A screen's root: a full-frame node whose children lay themselves out. */
class Screen extends Node {
  constructor() {
    super();
    this.w = 1920;
    this.h = 1080;
  }
  layout(): void {
    for (let i = 0; i < this.children.length; i++) {
      const kid = this.children[i] as Node & { layout?: () => void };
      if (kid.layout) kid.layout();
    }
  }
}

function home(r: Renderer, nav: Nav, open: (title: string) => void): Route {
  const node = new Screen();
  const page = node.add(new Column({ gap: 24 }));
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
  return {
    id: 'home',
    node: node,
    entry: () => 'home-0',
    // Runs with the node visible and laid out; returns the teardown the router calls on close.
    enter: () =>
      nav.strip({
        id: 'home',
        axis: 'x',
        scope: 'home',
        count: () => cards.length,
        item: (i) => 'home-' + i,
        label: (i) => 'Title ' + (i + 1),
        bounds: (i) => ({ x: page.x + rail.x + cards[i].x, y: page.y + rail.y + cards[i].y, w: cards[i].w, h: cards[i].h }),
        onFocus: (i) => {
          for (let k = 0; k < cards.length; k++) cards[k].focused = k === i;
          r.scene.invalidate();
        },
      }),
    // The route answers a key before the router does; false hands arrows and Back to it.
    key: (action) => {
      if (action !== 'select') return false;
      const at = nav.current === null ? -1 : parseInt(nav.current.slice('home-'.length), 10);
      open('Title ' + (at + 1));
      return true;
    },
  };
}

function detail(r: Renderer, nav: Nav): Route {
  const node = new Screen();
  const page = node.add(new Column({ gap: 32 }));
  page.x = 96;
  page.y = 300;
  const title = page.add(new Label(r.text, '', 64));
  page.add(new Label(r.text, 'Back returns to Home, and Home is where you left it.', 28, DIM));
  const play = page.add(new Card());
  play.w = 260;
  play.h = 84;
  return {
    id: 'detail',
    node: node,
    entry: () => 'detail-play',
    // `arg` is what `push` carried: which title this page is for.
    enter: (arg) => {
      title.str = arg || '';
      title.w = r.text.measure(title.str, { family: SANS, size: 64, weight: 700 });
      page.layout();
      return nav.strip({
        id: 'detail',
        axis: 'x',
        scope: 'detail',
        count: () => 1,
        item: () => 'detail-play',
        label: () => 'Play',
        bounds: () => ({ x: page.x + play.x, y: page.y + play.y, w: play.w, h: play.h }),
        onFocus: () => {
          play.focused = true;
          r.scene.invalidate();
        },
        onBlur: () => {
          play.focused = false;
        },
      });
    },
  };
}

export function run(canvas: HTMLCanvasElement): Demo {
  const nav = createNav();
  const r = createRenderer(canvas, { text: canvasText, focus: nav.host, speak: false });
  if (!r) throw new Error('WebGL unavailable');

  // The router owns the stack: a route's node, its focus scope, and the order of the two.
  const router = createRouter({
    root: r.root,
    focus: {
      openScope: (id, initial) => nav.openScope({ id: id, initial: initial }),
      closeScope: (id) => nav.closeScope(id),
      move: (dir) => nav.move(dir),
    },
  });
  router.register('home', () => home(r, nav, (title) => router.push('detail', title)));
  // `under` is what a deep link opens beneath this screen, so Back has somewhere to go.
  router.register('detail', () => detail(r, nav), { under: 'home', link: 'title' });
  router.push('home');

  return {
    renderer: r,
    // Arrows to focus, Select to the route, Back to the stack. False at the root is the app's cue to exit.
    handle: (a: InputAction) => router.handle(a),
    status: () => 'stack ' + router.trail.join(' > ') + '   focused ' + nav.current,
    dispose: () => r.scene.stop(),
  };
}
