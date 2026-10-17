import { Column, createRenderer, type InputAction, Node, type Painter, type Renderer, type Resolver } from 'tenfoot';
import { msdfAuto } from 'tenfoot/msdf/auto';
import { canvasText } from 'tenfoot/text/canvas';
import { msdfText } from 'tenfoot/text/msdf';
import { attach, color, createNav, FACES, inOrder, type Nav, type Release, RING_SHADER, type Theme, theme } from 'tenfoot/ui';
import type { Demo } from './demo.ts';

/**
 * The stories' screen: half the TV's, so a widget drawn at the design's size fills a page-wide
 * monitor at a readable scale, with the canvas backed at twice that so type stays crisp.
 */
export const STAGE = { w: 960, h: 540 };
const MARGIN = 40;
/** The width a story has between the margins. */
export const WIDE = STAGE.w - MARGIN * 2;

/** What a widget story draws into: a renderer wired the way ARENA+ wires its own, and the focus engine. */
export interface Kit {
  readonly r: Renderer;
  readonly nav: Nav;
  /** A column at the story's margin, so a story stacks its pieces and calls `layout()`. */
  readonly stage: Column;
}

/** The dark ground every screen of the design sits on. */
class Ground extends Node {
  override paint(p: Painter): void {
    p.rect(0, 0, this.w, this.h, color.ground);
  }
}

/**
 * The widgets set type from the design's baked faces and paint gradients through its alpha ramps.
 * Those files ship with the ARENA+ build next to this site, so every key the tier asks for is
 * looked up there; a story's own pictures are data URLs and go straight through.
 */
export function kit(canvas: HTMLCanvasElement, host: HTMLElement, t: Theme = {}): Kit {
  // The design, or the story's own, drawn in the stories' layout space rather than the TV's.
  theme({ brand: t.brand, family: t.family, tracking: t.tracking, radius: t.radius, space: t.space, focus: t.focus, color: t.color, type: t.type, screen: STAGE });
  const arena = (host.dataset.media || '').replace(/media\/$/, '');
  // A story's own pictures are data URLs and the faces below are already absolute; everything else is a tier key.
  const resolve: Resolver = (key) => [{ url: key.indexOf('data:') === 0 || key.indexOf('/') === 0 ? key : arena + key }];
  // The text tool fetches metrics itself, relative to the page, so the faces are pointed at the build by hand.
  const faces = FACES.map((f) => ({ family: f.family, weight: f.weight, atlas: arena + f.atlas, metrics: arena + f.metrics }));
  const nav = createNav();
  const r = createRenderer(canvas, {
    text: msdfText({ fallback: canvasText, faces: faces }),
    msdf: msdfAuto,
    effects: ['grade', 'shimmer'],
    resolve: resolve,
    focus: nav.host,
    speak: false,
    width: STAGE.w,
    height: STAGE.h,
    scale: 2,
  });
  if (!r) throw new Error('WebGL unavailable');
  attach({ text: r.text, images: inOrder(r.images, resolve, r.gl.caps), scene: r.scene, ring: r.gl.shader(RING_SHADER) });
  r.scene.addDirtySource(() => nav.tick(performance.now()));
  const ground = r.root.add(new Ground());
  ground.w = STAGE.w;
  ground.h = STAGE.h;
  const stage = r.root.add(new Column({ gap: 24 }));
  stage.x = MARGIN;
  stage.y = MARGIN - 8;
  return { r: r, nav: nav, stage: stage };
}

/** A picture a story makes for itself: an SVG gradient as a data URL, so nothing downloads. */
export function art(i: number, w = 320, h = 180): string {
  const hue = (i * 47) % 360;
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="hsl(' + hue + ',60%,45%)"/><stop offset="1" stop-color="hsl(' + ((hue + 60) % 360) + ',70%,20%)"/>' +
    '</linearGradient></defs><rect width="' + w + '" height="' + h + '" fill="url(#g)"/></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/**
 * Lays a tree out from the leaves up, twice. A flex container measures its children before it
 * places them, so a bar inside a column has to know its own height first; the second pass is for
 * a container whose size the first pass changed.
 */
export function settle(n: Node): void {
  for (let pass = 0; pass < 2; pass++) settleOnce(n);
}

function settleOnce(n: Node): void {
  for (let i = 0; i < n.children.length; i++) settleOnce(n.children[i]);
  const c = n as { invalidateLayout?: () => void; layout?: () => void };
  if (typeof c.invalidateLayout === 'function') c.invalidateLayout();
  if (typeof c.layout === 'function') c.layout();
}

/** The demo the page runs: arrows move focus, OK goes to the story, and everything is let go on dispose. */
export function story(k: Kit, releases: Release[], onSelect?: () => void): Demo {
  k.r.scene.invalidate();
  return {
    renderer: k.r,
    handle: (action: InputAction) => {
      if (action === 'up' || action === 'down' || action === 'left' || action === 'right') {
        k.nav.move(action);
        return true;
      }
      if (action === 'select' && onSelect !== undefined) {
        onSelect();
        return true;
      }
      return false;
    },
    status: () => (k.nav.current === null ? '' : 'focused ' + k.nav.current),
    dispose: () => {
      for (let i = releases.length - 1; i >= 0; i--) releases[i]();
      k.r.scene.stop();
      // The tokens are one module for every story on a page: the design goes back to the mock's.
      theme();
    },
  };
}
