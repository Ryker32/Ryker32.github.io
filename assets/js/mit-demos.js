// Always-visible demos on the MIT source page. Each demo box mounts as it
// approaches the viewport (so the page itself stays light). The REIP replay
// starts playing the first time it is mostly on screen; the webcam demo waits
// for the reader to press Start camera.
const MODULES = {
  reip: '/assets/js/reip-replay.js',
  linqbot: '/assets/js/linqbot-demo.js',
};

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.mm-demo[data-demo-kind]').forEach((box) => {
  const kind = box.dataset.demoKind;
  const mountEl = box.querySelector('[data-demo-mount]');
  if (!mountEl || !MODULES[kind]) return;

  let api = null;
  let started = false;

  const load = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    load.disconnect();
    import(MODULES[kind])
      .then((mod) => mod.mount(mountEl, {}))
      .then((a) => { api = a; maybeStart(); })
      .catch((err) => {
        console.error(`Demo ${kind} failed to load:`, err);
        mountEl.classList.add('lq-demo--failed');
      });
  }, { rootMargin: '400px 0px' });
  load.observe(box);

  let visible = false;
  function maybeStart() {
    if (kind !== 'reip' || started || reduced || !api || !visible) return;
    started = true;
    api.play();
  }
  if (kind === 'reip') {
    new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.intersectionRatio >= 0.4);
      maybeStart();
    }, { threshold: [0, 0.4] }).observe(box);
  }
});
