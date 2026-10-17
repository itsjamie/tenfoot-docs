import { createRenderer, Node, type Painter } from 'tenfoot';
import { canvasText } from 'tenfoot/text/canvas';
import { type Demo, PLATE } from './demo.ts';

// A node paints itself in its own coordinates; the scene puts it where its x and y say.
class Card extends Node {
  override paint(p: Painter): void {
    p.rect(0, 0, this.w, this.h, PLATE, 12);
    p.border(0, 0, this.w, this.h, 2, [1, 1, 1, 0.12], 12);
  }
}

export function run(canvas: HTMLCanvasElement): Demo {
  // The text rasteriser is named, not defaulted: an app ships only the one it imports.
  const r = createRenderer(canvas, { text: canvasText, speak: false });
  if (!r) throw new Error('WebGL unavailable');

  // Every coordinate is a logical 1920x1080 pixel, whatever size the canvas is drawn at.
  const card = r.root.add(new Card());
  card.w = 300;
  card.h = 168;
  card.x = (1920 - card.w) / 2;
  card.y = (1080 - card.h) / 2;

  // Nothing paints until something asks. An idle screen costs no frames at all.
  r.scene.invalidate();
  return { renderer: r, handle: () => false, dispose: () => r.scene.stop() };
}
