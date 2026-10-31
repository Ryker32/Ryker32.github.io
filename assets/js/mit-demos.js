// Inline "Run demo" toggles on the MIT source page. Nothing loads until a
// button is pressed; closing a demo disposes it (stops the camera / replay).
const MODULES = {
  reip: '/assets/js/reip-replay.js',
  linqbot: '/assets/js/linqbot-demo.js',
};

document.querySelectorAll('[data-demo-toggle]').forEach((btn) => {
  const panel = document.getElementById(btn.dataset.demoToggle);
  const mountEl = panel && panel.querySelector('[data-demo-mount]');
  const label = btn.querySelector('[data-demo-label]');
  const kind = panel && panel.dataset.demoKind;
  if (!panel || !mountEl || !MODULES[kind]) return;

  let api = null;
  let loading = null;

  async function open() {
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    label.textContent = 'Close demo';
    panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    if (api || loading) return;
    loading = import(MODULES[kind])
      .then((mod) => mod.mount(mountEl, { autoplay: true }))
      .then((a) => {
        api = a;
        if (panel.hidden) close(); // closed while loading
      })
      .catch((err) => {
        console.error(`Demo ${kind} failed to load:`, err);
        mountEl.classList.add('lq-demo--failed');
      })
      .finally(() => { loading = null; });
  }

  function close() {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    label.textContent = 'Run demo';
    if (api) {
      try { api.dispose(); } catch (err) { console.error(err); }
      api = null;
    }
  }

  btn.addEventListener('click', () => (panel.hidden ? open() : close()));
});
