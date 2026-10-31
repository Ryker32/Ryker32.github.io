// Host for the LinqBot "try it with your own hand" webcam demo inside the
// project modal. The demo modules under /assets/js/pages/linqbot/ and the 3D
// stage in /assets/js/lib/stage.js are copied unchanged from Jerry Li's LinqBot
// write-up on jerryli.design (github.com/jerryli08/jerryli08.github.io); this
// file only supplies the small context object their page framework passed in.
//
// Mounting draws a start card only. Nothing else loads (arm model, MediaPipe
// hand tracker) until the reader presses Start camera, and video never leaves
// the browser. Requires the "three" import map in _layouts/default.html.
import { mount as mountWebcam } from './pages/linqbot/webcam.js';

export async function mount(host) {
  const stage = host.querySelector('[data-lq-stage]');
  const panel = host.querySelector('[data-lq-panel]');
  if (!stage) throw new Error('LinqBot demo: missing [data-lq-stage]');

  const ctx = {
    id: 'linqbot-webcam',
    slug: 'linqbot',
    data: {},
    asset: (path) => path,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isTouch: window.matchMedia('(pointer: coarse)').matches,
    panel,
    kind: 'demo',
    width: 'full',
    shift: () => [0, 0],
  };
  stage.rxShift = ctx.shift;

  const api = (await mountWebcam(stage, ctx)) || {};
  return {
    dispose() {
      try { api.dispose?.(); } finally {
        stage.dispatchEvent(new Event('rx:unmount'));
        panel?.replaceChildren();
      }
    },
  };
}
