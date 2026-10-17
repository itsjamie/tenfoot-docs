import type { InputAction, Renderer } from 'tenfoot';

/** What every step hands the page: the renderer to read numbers off, a remote to press, and a stop. */
export interface Demo {
  readonly renderer: Renderer;
  /** A remote key, as the platform names it. True when the demo used it. */
  handle(action: InputAction): boolean;
  /** One line the monitor prints under the picture, when the step has something to say. */
  status?(): string;
  dispose(): void;
}

/** The one font the tutorial sets type in: a stack every browser resolves, so there is nothing to fetch. */
export const SANS = 'Arial, Helvetica, sans-serif';
export const WHITE = [1, 1, 1, 1];
export const DIM = [1, 1, 1, 0.55];
export const PLATE = [0.09, 0.11, 0.16, 1];
export const RING = [0.24, 0.63, 1, 1];

/** A step: given the canvas and the element it sits in, which a step that needs a video plane fills. */
export type Step = (canvas: HTMLCanvasElement, host: HTMLElement) => Demo;
