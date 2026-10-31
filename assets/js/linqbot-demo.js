// Host for the LinqBot "try it with your own hand" webcam demo. The demo
// modules under /assets/js/pages/linqbot/ and the 3D stage in
// /assets/js/lib/stage.js are copied unchanged from Jerry Li's LinqBot
// write-up on jerryli.design (github.com/jerryli08/jerryli08.github.io); this
// file only supplies the small context object their page framework passed in,
// and moves the camera preview into a side column (if the host provides one)
// so it doesn't cover the arm.
//
// Mounting draws a start card only. Nothing else loads (arm model, MediaPipe
// hand tracker) until the reader presses Start camera, and video never leaves
// the browser. Requires the "three" import map in the page layout.
import { mount as mountWebcam } from './pages/linqbot/webcam.js';

export async function mount(host) {
  const stage = host.querySelector('[data-lq-stage]');
  const panel = host.querySelector('[data-lq-panel]');
  const side = host.querySelector('[data-lq-side]');
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

  // The demo appends its camera preview (.lq-pip) into the stage once the
  // camera starts; relocate it beside the stage instead of over the arm.
  let mo = null;
  if (side) {
    const relocate = () => {
      const pip = stage.querySelector(':scope > .lq-pip');
      if (pip) {
        side.appendChild(pip);
        host.classList.add('lq-demo--has-cam');
      }
    };
    mo = new MutationObserver(relocate);
    mo.observe(stage, { childList: true });
  }

  const api = (await mountWebcam(stage, ctx)) || {};
  return {
    dispose() {
      try { api.dispose?.(); } finally {
        mo?.disconnect();
        side?.replaceChildren();
        host.classList.remove('lq-demo--has-cam');
        stage.dispatchEvent(new Event('rx:unmount'));
        panel?.replaceChildren();
      }
    },
  };
}
