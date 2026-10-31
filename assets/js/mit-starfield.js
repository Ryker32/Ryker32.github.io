// Static starfield backdrop for the unlisted Maker Portfolio page.
// Same palette as the homepage hero (hero3d.js), but drawn once: no cursor
// lensing, no intro ripple, no animation loop. Redrawn only when the
// viewport width changes.
(function () {
  const canvas = document.getElementById('mmStars');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');

  const STARS = [
    { color: '#f2f2f2', weight: 3 },
    { color: '#b9bec9', weight: 5 },
    { color: '#7878c0', weight: 4 },
    { color: '#7890c0', weight: 3 },
    { color: '#9caee6', weight: 2 },
    { color: '#5c8a86', weight: 3 },
    { color: '#3f6b66', weight: 2 }
  ];
  const NEBULA = ['120,120,192', '111,134,184', '138,111,184', '92,138,134'];

  const pool = [];
  STARS.forEach(({ color, weight }) => { for (let i = 0; i < weight; i++) pool.push(color); });

  // Seeded PRNG so the field looks the same on every visit
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  let lastWidth = 0;

  function draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const rand = rng(1729);

    // A few very faint nebula washes
    for (let i = 0; i < 4; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const r = (0.25 + rand() * 0.3) * Math.max(w, h);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const c = NEBULA[i % NEBULA.length];
      g.addColorStop(0, 'rgba(' + c + ',0.05)');
      g.addColorStop(1, 'rgba(' + c + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // Stars: tiny squares like the homepage, density scaled to area
    const count = Math.round((w * h) / 2600);
    for (let i = 0; i < count; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const size = rand() < 0.08 ? 2 : (rand() < 0.5 ? 1.2 : 0.8);
      ctx.globalAlpha = 0.25 + rand() * 0.6;
      ctx.fillStyle = pool[(rand() * pool.length) | 0];
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
    lastWidth = w;
  }

  let timer = null;
  window.addEventListener('resize', function () {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Ignore mobile URL-bar height jitter; redraw on width change or growth
    if (Math.abs(window.innerWidth - lastWidth) < 2 && canvas.height >= Math.round(window.innerHeight * dpr)) return;
    clearTimeout(timer);
    timer = setTimeout(draw, 150);
  });

  draw();
})();
