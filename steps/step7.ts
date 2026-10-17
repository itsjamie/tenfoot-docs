import { createRenderer, type InputAction, Node, type Painter, type Renderer, TextSlot } from 'tenfoot';
import { canvasText } from 'tenfoot/text/canvas';
import { type Demo, DIM, SANS, WHITE } from './demo.ts';

/**
 * The player's chrome: a scrim, a title, and a seek bar that follows the clock. Everything the
 * viewer sees moving is drawn by the renderer; the picture itself is the browser's video element
 * under the transparent canvas, which is how every television plays: the set decodes, we draw.
 */
class Chrome extends Node {
  private r: Renderer;
  private title = new TextSlot();
  private hint = new TextSlot();
  constructor(r: Renderer) {
    super();
    this.r = r;
    this.w = 1920;
    this.h = 1080;
  }
  override paint(p: Painter): void {
    const c = this.r.controller!;
    const s = c.state;
    p.rect(0, 780, 1920, 300, [0, 0, 0, 0.55]);
    p.text(this.title.get(this.r.text, 'Northgate FC vs Rivermoor', { family: SANS, size: 44, weight: 700 }), 96, 820, WHITE);
    const words = s.status === 'playing' ? 'OK pauses · ← → seek 10 s' : s.status === 'idle' || s.status === 'paused' ? 'OK plays · ← → seek 10 s' : s.status;
    p.text(this.hint.get(this.r.text, words, { family: SANS, size: 24, weight: 400 }), 96, 884, DIM);
    // The bar: a track, and a fill as far as the clock has come.
    const at = s.duration > 0 ? Math.min(1, c.time() / s.duration) : 0;
    p.rect(96, 960, 1728, 6, [1, 1, 1, 0.2], 3);
    if (at > 0) p.rect(96, 960, 1728 * at, 6, [0.24, 0.63, 1, 1], 3);
  }
}

export function run(canvas: HTMLCanvasElement, host: HTMLElement): Demo {
  // The app owns the <video>: whatever player it uses (Shaka, hls.js, the set's own) attaches
  // there, and the renderer only reads its clock and its state. It sits under the canvas.
  // Where this page keeps the clip and its captions; an application names its own URLs.
  const media = host.dataset.media || './';
  const video = document.createElement('video');
  video.muted = true;
  video.setAttribute('playsinline', '');
  video.preload = 'none';
  video.src = media + 'match.webm';
  const track = document.createElement('track');
  track.kind = 'subtitles';
  track.srclang = 'en';
  track.label = 'English';
  track.src = media + 'match.en.vtt';
  video.appendChild(track);
  host.insertBefore(video, canvas);

  const r = createRenderer(canvas, { text: canvasText, video: video, speak: false });
  if (!r) throw new Error('WebGL unavailable');
  const controller = r.controller!;
  const captions = r.subtitles!;

  r.root.add(new Chrome(r));
  // The caption layer is a node like any other; add it where captions should paint. It schedules
  // cues against the media clock, and keeps out of the way of whatever rectangles it is told about.
  r.root.add(captions);
  captions.setAvoid([{ x: 0, y: 780, w: 1920, h: 300 }]);

  // Playback state is a stream; every change is a reason to repaint the chrome.
  const off = controller.on((s) => {
    if (!s.activeSubtitleTrack && s.subtitleTracks.length > 0) controller.selectSubtitle(s.subtitleTracks[0].id);
    r.scene.invalidate();
  });
  // While the clock runs, the bar moves: a dirty source that says so once a quarter second.
  let quarter = -1;
  const offClock = r.scene.addDirtySource(() => {
    if (controller.state.status !== 'playing') return false;
    const q = Math.floor(controller.time() * 4);
    if (q === quarter) return false;
    quarter = q;
    return true;
  });
  controller.setVisible(true);
  r.scene.invalidate();

  return {
    renderer: r,
    handle: (a: InputAction) => {
      const s = controller.state.status;
      if (a === 'select' || a === 'playPause') {
        if (s === 'playing' || s === 'buffering') controller.pause();
        else controller.play();
        return true;
      }
      if (a === 'left' || a === 'right') {
        controller.seek(controller.time() + (a === 'left' ? -10 : 10));
        return true;
      }
      return false;
    },
    status: () => controller.state.status + ' ' + controller.time().toFixed(1) + ' s' + (captions.active.length > 0 ? '   caption: ' + captions.active[0] : ''),
    dispose: () => {
      off();
      offClock();
      controller.pause();
      r.scene.stop();
      video.remove();
    },
  };
}
