import { Column, createRenderer, Node, type Painter, Row, type Text, TextSlot } from 'tenfoot';
import { canvasText } from 'tenfoot/text/canvas';
import { type Demo, PLATE, SANS, WHITE } from './demo.ts';

class Card extends Node {
  override paint(p: Painter): void {
    p.rect(0, 0, this.w, this.h, PLATE, 12);
  }
}

// A line of text is a run the rasteriser cached; the slot keeps it across frames.
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
  const r = createRenderer(canvas, { text: canvasText, speak: false });
  if (!r) throw new Error('WebGL unavailable');

  // Row, Column and Grid are the whole layout engine: gap, padding, justify, align, grow.
  const page = r.root.add(new Column({ gap: 24 }));
  page.x = 96;
  page.y = 380;
  page.add(new Label(r.text, 'Continue watching'));

  const rail = page.add(new Row({ gap: 24 }));
  for (let i = 0; i < 5; i++) {
    const card = rail.add(new Card());
    card.w = 320;
    card.h = 180;
  }

  // A container lays out when it paints, or now, so the numbers can be read before a frame.
  page.layout();
  r.scene.invalidate();
  return { renderer: r, handle: () => false, dispose: () => r.scene.stop() };
}
