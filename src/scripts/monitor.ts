/**
 * Runs a tutorial step on the page: a fresh canvas in the monitor's screen, a remote that only
 * answers while the screen holds the keyboard, and the renderer's own numbers printed under it.
 */
import type { InputAction } from 'tenfoot';
import type { Demo, Step } from '../../steps/demo.ts';
import * as step1 from '../../steps/step1.ts';
import * as step2 from '../../steps/step2.ts';
import * as step3 from '../../steps/step3.ts';
import * as step4 from '../../steps/step4.ts';
import * as step5 from '../../steps/step5.ts';
import * as step6 from '../../steps/step6.ts';
import * as step7 from '../../steps/step7.ts';
import * as widgetsCards from '../../steps/widgets-cards.ts';
import * as widgetsControls from '../../steps/widgets-controls.ts';
import * as widgetsGrid from '../../steps/widgets-grid.ts';
import * as widgetsNav from '../../steps/widgets-nav.ts';
import * as widgetsRail from '../../steps/widgets-rail.ts';
import * as widgetsText from '../../steps/widgets-text.ts';
import * as widgetsTheme from '../../steps/widgets-theme.ts';

const STEPS: { [id: string]: Step } = {
  'step-1': step1.run,
  'step-2': step2.run,
  'step-3': step3.run,
  'step-4': step4.run,
  'step-5': step5.run,
  'step-6': step6.run,
  'step-7': step7.run,
  'widgets-text': widgetsText.run,
  'widgets-controls': widgetsControls.run,
  'widgets-cards': widgetsCards.run,
  'widgets-rail': widgetsRail.run,
  'widgets-grid': widgetsGrid.run,
  'widgets-nav': widgetsNav.run,
  'widgets-theme': widgetsTheme.run,
};

const KEYS: { [code: string]: InputAction } = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Enter: 'select',
  ' ': 'select',
  Backspace: 'back',
  Escape: 'back',
};

class Monitor {
  private screen: HTMLElement;
  private readout: HTMLElement;
  private status: HTMLElement;
  private demo: Demo | null = null;
  private frames = 0;

  constructor(root: HTMLElement, run: Step) {
    this.screen = root.querySelector('.screen') as HTMLElement;
    this.readout = root.querySelector('.readout') as HTMLElement;
    this.status = root.querySelector('.status') as HTMLElement;
    this.screen.addEventListener('keydown', (e) => {
      const action = KEYS[e.key];
      if (action === undefined || this.demo === null) return;
      if (this.demo.handle(action)) e.preventDefault();
      this.print();
    });
    const pad = root.querySelectorAll<HTMLButtonElement>('.pad button');
    for (let i = 0; i < pad.length; i++) {
      pad[i].addEventListener('click', () => {
        if (this.demo === null) return;
        this.demo.handle(pad[i].dataset.key as InputAction);
        this.screen.focus();
        this.print();
      });
    }
    const canvas = document.createElement('canvas');
    this.screen.appendChild(canvas);
    try {
      this.demo = run(canvas, this.screen);
    } catch (e) {
      this.readout.textContent = 'This browser has no WebGL, so the step cannot run here: ' + (e as Error).message;
      return;
    }
    this.demo.renderer.scene.onPaint(() => {
      this.frames++;
      this.print();
    });
    this.print();
  }

  private print(): void {
    if (this.demo === null) return;
    const d = this.demo.renderer.diagnostics();
    this.readout.textContent =
      'draw calls ' + d.drawCalls() + '   quads ' + d.stats.quads + '   paint ' + d.scene.lastPaintMs.toFixed(2) + ' ms   frames painted ' + this.frames;
    this.status.textContent = this.demo.status === undefined ? '' : this.demo.status();
  }
}

/** Wires every monitor on the page that has not been wired. Safe to call more than once. */
export function mount(): void {
  const roots = document.querySelectorAll<HTMLElement>('.monitor[data-step]');
  for (let i = 0; i < roots.length; i++) {
    const root = roots[i];
    if (root.dataset.mounted === 'true') continue;
    root.dataset.mounted = 'true';
    const run = STEPS[root.dataset.step as string];
    if (run) new Monitor(root, run);
  }
}
