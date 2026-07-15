// Hero particle swarm: a starfield of tiny square particles whose light is
// gravitationally lensed around the cursor, like the distortion of a black hole:
// stars are deflected outward (point-lens equation), smeared into tangential
// arcs near the Einstein ring, and nothing renders inside the shadow.
// Palette: whites, periwinkle blues, and dark teals against near-black.

const DARK_PALETTE = [
  { color: '#f2f2f2', weight: 3 },   // bright white
  { color: '#b9bec9', weight: 5 },   // dim gray
  { color: '#7878c0', weight: 4 },   // periwinkle
  { color: '#7890c0', weight: 3 },   // steel blue
  { color: '#9caee6', weight: 2 },   // pale blue
  { color: '#5c8a86', weight: 3 },   // teal
  { color: '#3f6b66', weight: 2 }    // deep green-teal
];

const LIGHT_PALETTE = [
  { color: '#20242e', weight: 4 },
  { color: '#3a4256', weight: 4 },
  { color: '#3c4a86', weight: 4 },
  { color: '#33508c', weight: 3 },
  { color: '#2e5f5a', weight: 3 },
  { color: '#1e4a45', weight: 2 }
];

// Galaxy colors: warm core fading to cool blue arms
const GALAXY_DARK = {
  core: ['#f5e8cf', '#eadbb8', '#e8e4dc'],
  arm: ['#8d9dd6', '#7890c0', '#a9b6e2', '#6f86b8', '#5c8a86']
};
const GALAXY_LIGHT = {
  core: ['#4a4438', '#565040', '#3e3a30'],
  arm: ['#3c4a86', '#33508c', '#3a4256', '#2e5f5a']
};

function getThemeMode() {
  return document.body?.dataset?.theme === 'light' ? 'light' : 'dark';
}

function buildColorPool(palette) {
  const pool = [];
  palette.forEach(({ color, weight }) => {
    for (let i = 0; i < weight; i++) pool.push(color);
  });
  return pool;
}

function initHeroSwarm() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.classList.add('hero-fallback');
    if (canvas.parentElement) canvas.parentElement.classList.add('hero-fallback');
    document.dispatchEvent(new Event('hero-ready'));
    document.dispatchEvent(new Event('hero-reveal-complete'));
    return;
  }

  const prefersMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let colorPool = buildColorPool(getThemeMode() === 'light' ? LIGHT_PALETTE : DARK_PALETTE);

  const particles = [];

  // Black-hole lens tuning
  const EINSTEIN_RADIUS = 92;              // px, radius of the ring / shadow
  const LENS_RANGE_MULT = 3.6;             // influence extends this many Einstein radii
  const MAX_STRETCH = 14;                  // cap on tangential arc smearing
  const STRETCH_GAIN = 1.9;                // exaggerate arcs so they read on screen

  // Lens position eases toward the pointer so the distortion glides
  const lens = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false, strength: 0 };

  // Intro ripple: a liquid wave expanding from (x, y). Stars near the
  // wavefront are displaced radially by a damped push-pull wave (like water)
  // and glint as the crest passes. Radius follows the same easing as the DOM
  // ripple ring so both stay in sync. Triggered by the intro sequence.
  let introRipple = null;
  window.__heroRipple = (x, y, maxR, duration) => {
    introRipple = { x, y, maxR, duration, start: performance.now() };
  };
  const RIPPLE_BAND = 130;   // width of the wave band in px

  // Ambient drift tuning
  const HOME_SPRING = 0.01;
  const DAMPING = 0.9;
  const DRIFT = 0.018;

  // 0 → hidden, 1 → fully revealed
  let reveal = 0;
  let revealTarget = 0;

  function pickColor() {
    return colorPool[(Math.random() * colorPool.length) | 0];
  }

  function makeParticle(px, py) {
    return {
      hx: px, hy: py,          // home
      x: px, y: py,            // current
      vx: 0, vy: 0,
      size: Math.random() < 0.82 ? (0.7 + Math.random() * 1.3) : (1.8 + Math.random() * 1.4),
      color: pickColor(),
      baseAlpha: 0.35 + Math.random() * 0.65,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.3 + Math.random() * 1.2,
      driftPhase: Math.random() * Math.PI * 2
    };
  }

  function populate() {
    particles.length = 0;
    const density = prefersMotion ? 1500 : 2600;
    const count = Math.max(420, Math.min(1500, Math.round((width * height) / density)));
    for (let i = 0; i < count; i++) {
      particles.push(makeParticle(Math.random() * width, Math.random() * height));
    }
  }

  // --- Background spiral galaxy (point cloud) ---
  // Stored in galaxy-local polar coords so it can slowly rotate; tilted into
  // a 3/4 view when projected to the screen.
  const galaxy = {
    x: 0, y: 0,               // screen center
    points: [],               // { r, theta, size, alpha, color, isCore }
    tilt: 0.52,               // squash factor (edge-on < 1 < face-on)
    lean: -0.55,              // rotation of the whole disc on screen
    radius: 0,
    cosLean: Math.cos(-0.55),
    sinLean: Math.sin(-0.55)
  };

  function gaussian() {
    return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  }

  function populateGalaxy() {
    galaxy.points.length = 0;
    const light = getThemeMode() === 'light';
    const colors = light ? GALAXY_LIGHT : GALAXY_DARK;

    galaxy.x = width * 0.76;
    galaxy.y = height * 0.24;
    galaxy.radius = Math.min(width, height) * 0.17;

    const R = galaxy.radius;
    const ARMS = 2;
    const TWIST = 2.6;                       // how tightly the arms wind
    const armCount = prefersMotion ? 640 : 400;
    const bulgeCount = Math.round(armCount * 0.3);
    const haloCount = Math.round(armCount * 0.22);

    for (let i = 0; i < armCount; i++) {
      const t = Math.pow(Math.random(), 0.72);   // denser toward the core
      const r = R * (0.12 + 0.88 * t);
      const arm = (i % ARMS) * (Math.PI * 2 / ARMS);
      // Log-spiral arm angle plus scatter that widens with radius
      const theta = arm + TWIST * Math.log(1 + 4 * t) + gaussian() * (0.1 + 0.22 * t);
      const nearCore = t < 0.3;
      const pool = nearCore ? colors.core : colors.arm;
      galaxy.points.push({
        r,
        theta,
        size: nearCore ? (0.6 + Math.random() * 0.9) : (0.5 + Math.random() * 0.8),
        alpha: (nearCore ? 0.5 : 0.3) + Math.random() * 0.3,
        color: pool[(Math.random() * pool.length) | 0]
      });
    }

    // Central bulge: tight gaussian blob, warmer and brighter
    for (let i = 0; i < bulgeCount; i++) {
      const r = Math.abs(gaussian()) * R * 0.18;
      galaxy.points.push({
        r,
        theta: Math.random() * Math.PI * 2,
        size: 0.6 + Math.random() * 1.1,
        alpha: 0.45 + Math.random() * 0.45,
        color: colors.core[(Math.random() * colors.core.length) | 0]
      });
    }

    // Diffuse halo: very dim scattered points that soften the whole disc
    for (let i = 0; i < haloCount; i++) {
      const r = Math.abs(gaussian()) * R * 0.75;
      const pool = r < R * 0.25 ? colors.core : colors.arm;
      galaxy.points.push({
        r,
        theta: Math.random() * Math.PI * 2,
        size: 0.5 + Math.random() * 0.6,
        alpha: 0.08 + Math.random() * 0.16,
        color: pool[(Math.random() * pool.length) | 0]
      });
    }
  }

  function handleResize() {
    const fullscreenPhase = document.body.classList.contains('animation-loading') ||
      document.body.classList.contains('animation-ready');

    const w = fullscreenPhase
      ? window.innerWidth
      : (canvas.clientWidth || canvas.offsetWidth || window.innerWidth);
    const h = fullscreenPhase
      ? window.innerHeight
      : (canvas.clientHeight || canvas.offsetHeight || window.innerHeight);

    if (w === 0 || h === 0) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = w;
    height = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    populate();
    populateGalaxy();
  }

  handleResize();
  window.addEventListener('resize', handleResize);

  const lensRange = EINSTEIN_RADIUS * LENS_RANGE_MULT;

  window.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    lens.tx = event.clientX - rect.left;
    lens.ty = event.clientY - rect.top;
    lens.active = lens.tx >= -lensRange && lens.tx <= rect.width + lensRange &&
      lens.ty >= -lensRange && lens.ty <= rect.height + lensRange;
  });
  window.addEventListener('pointerleave', () => { lens.active = false; });

  function applyThemePalette() {
    colorPool = buildColorPool(getThemeMode() === 'light' ? LIGHT_PALETTE : DARK_PALETTE);
    particles.forEach(p => { p.color = pickColor(); });
    populateGalaxy();
  }

  const themeObserver = new MutationObserver(applyThemePalette);
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  // Draws a star as a small rectangle stretched tangentially around the lens
  function drawLensedImage(p, alpha, imgX, imgY, tangentialStretch, radialSquash, angle) {
    ctx.globalAlpha = Math.min(alpha, 1);
    ctx.fillStyle = p.color;
    const s = p.size;
    const w = s * Math.min(tangentialStretch, MAX_STRETCH);
    const h = Math.max(s * radialSquash, 0.5);
    ctx.translate(imgX, imgY);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function step(t) {
    // Ease reveal toward its target so particles fade in smoothly
    reveal += (revealTarget - reveal) * 0.035;

    // Lens glides after the pointer and fades in/out smoothly
    if (prefersMotion) {
      if (lens.active && lens.tx > -9000) {
        if (lens.x < -9000) { lens.x = lens.tx; lens.y = lens.ty; }
        lens.x += (lens.tx - lens.x) * 0.16;
        lens.y += (lens.ty - lens.y) * 0.16;
      }
      lens.strength += ((lens.active ? 1 : 0) - lens.strength) * 0.07;
    }

    const lensX = lens.x;
    const lensY = lens.y;
    const thetaE = EINSTEIN_RADIUS * lens.strength;
    const thetaESq = thetaE * thetaE;
    const range = lensRange;
    const lensOn = thetaE > 1;

    // Intro ripple state for this frame: current wavefront radius and how
    // much energy the wave still carries (it decays as it spreads out)
    let ripR = -1;
    let ripAmp = 0;
    if (introRipple) {
      const rt = (t - introRipple.start) / introRipple.duration;
      if (rt >= 1) {
        introRipple = null;
      } else if (rt > 0) {
        const p = 1 - Math.pow(1 - rt, 3);   // easeOutCubic, matches DOM ring
        ripR = introRipple.maxR * p;
        ripAmp = 30 * (1 - rt * 0.75);
      }
    }

    // Water-wave displacement for a point at (x, y): a push ahead of the
    // crest and a pull behind it, fading at the band's edges. Returns
    // [offsetX, offsetY, glint] where glint brightens the crest.
    const rippleOffset = (x, y) => {
      const dx = x - introRipple.x;
      const dy = y - introRipple.y;
      const d = Math.hypot(dx, dy) || 1;
      const u = (d - ripR) / RIPPLE_BAND;
      if (u < -1 || u > 1) return null;
      const envelope = Math.cos(u * Math.PI / 2);   // 1 at crest, 0 at edges
      const push = Math.sin(u * Math.PI) * ripAmp * envelope;
      return [(dx / d) * push, (dy / d) * push, envelope * envelope];
    };

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const time = t * 0.001;

    // --- Galaxy layer (behind the stars) ---
    // The spiral pattern rotates rigidly (like a density wave), so the arms
    // never wind up or shear apart. Negative direction = arms trail.
    const galaxyTheta = prefersMotion ? -time * 0.018 : 0;
    for (let i = 0; i < galaxy.points.length; i++) {
      const gp = galaxy.points[i];
      const theta = gp.theta + galaxyTheta;

      // Disc coords -> tilted, leaned screen position
      const px = Math.cos(theta) * gp.r;
      const py = Math.sin(theta) * gp.r * galaxy.tilt;
      let gx = galaxy.x + px * galaxy.cosLean - py * galaxy.sinLean;
      let gy = galaxy.y + px * galaxy.sinLean + py * galaxy.cosLean;

      let alpha = gp.alpha * reveal;
      if (alpha < 0.01) continue;

      // Liquid ripple: displace with the passing wave and glint at the crest
      if (ripAmp > 0.4) {
        const off = rippleOffset(gx, gy);
        if (off) {
          gx += off[0];
          gy += off[1];
          alpha = Math.min(alpha * (1 + 1.2 * off[2]), 1);
        }
      }

      // The lens bends galaxy light too (primary image only)
      if (lensOn) {
        const dx = gx - lensX;
        const dy = gy - lensY;
        const bSq = dx * dx + dy * dy;
        if (bSq < range * range) {
          const b = Math.max(Math.sqrt(bSq), 0.75);
          const edge = Math.min(Math.max((range - b) / (range * 0.45), 0), 1);
          const w = edge * edge * (3 - 2 * edge);
          const root = Math.sqrt(bSq + 4 * thetaESq);
          const r1 = b + ((b + root) / 2 - b) * w;
          const stretch1 = 1 + ((b + root) / (2 * b) - 1) * STRETCH_GAIN * w;
          const squash1 = 1 - (0.5 - b / (2 * root)) * w;
          drawLensedImage(
            gp, alpha * Math.min(1 + (stretch1 * squash1 - 1) * w, 2),
            lensX + (dx / b) * r1, lensY + (dy / b) * r1,
            stretch1, squash1, Math.atan2(dy, dx)
          );
          continue;
        }
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = gp.color;
      ctx.fillRect(gx - gp.size / 2, gy - gp.size / 2, gp.size, gp.size);
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (prefersMotion) {
        // Gentle ambient drift, like slow current
        p.vx += Math.cos(time * 0.4 + p.driftPhase) * DRIFT;
        p.vy += Math.sin(time * 0.3 + p.driftPhase * 1.7) * DRIFT;

        // Spring back toward home
        p.vx += (p.hx - p.x) * HOME_SPRING;
        p.vy += (p.hy - p.y) * HOME_SPRING;

        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;
      }

      const twinkle = 0.75 + 0.25 * Math.sin(time * p.twinkleSpeed + p.twinklePhase);
      let alpha = p.baseAlpha * twinkle * reveal;
      if (alpha < 0.01) continue;

      // Liquid ripple: the passing wave physically displaces the star's
      // drawn position and makes it glint at the crest
      let sx = p.x;
      let sy = p.y;
      if (ripAmp > 0.4) {
        const off = rippleOffset(sx, sy);
        if (off) {
          sx += off[0];
          sy += off[1];
          alpha = Math.min(alpha * (1 + 1.4 * off[2]), 1);
        }
      }

      // Gravitational lensing: bend the star's light around the cursor.
      // Point-lens mapping: a source at distance b from the lens appears at
      // r = (b + sqrt(b^2 + 4*thetaE^2)) / 2, always outside the Einstein ring.
      if (lensOn) {
        const dx = sx - lensX;
        const dy = sy - lensY;
        const bSq = dx * dx + dy * dy;
        if (bSq < range * range) {
          const b = Math.max(Math.sqrt(bSq), 0.75);

          // Fade the lens influence to zero at the edge of its range so
          // distant stars are untouched (no seam at the boundary)
          const edge = Math.min(Math.max((range - b) / (range * 0.45), 0), 1);
          const w = edge * edge * (3 - 2 * edge); // smoothstep

          const root = Math.sqrt(bSq + 4 * thetaESq);
          const angle = Math.atan2(dy, dx);
          const ux = dx / b;
          const uy = dy / b;

          // Primary image: pushed outside the ring, stretched into an arc.
          // Magnification brightens it near the ring: that pile-up of bent
          // starlight is what forms the visible ring.
          const r1 = b + ((b + root) / 2 - b) * w;
          const stretch1 = 1 + ((b + root) / (2 * b) - 1) * STRETCH_GAIN * w;
          const squash1 = 1 - (0.5 - b / (2 * root)) * w;
          drawLensedImage(
            p, alpha * Math.min(1 + (stretch1 * squash1 - 1) * w, 2.4),
            lensX + ux * r1, lensY + uy * r1,
            stretch1, squash1, angle
          );

          // Secondary image: faint inverted counter-arc hugging the inside of
          // the ring. Only exists close to the lens; images that fall too deep
          // are "captured"; that darkness is the shadow.
          const r2 = (root - b) / 2;
          if (b < thetaE * 2.4 && r2 > thetaE * 0.45) {
            const stretch2 = 1 + (r2 / b - 1) * STRETCH_GAIN;
            const squash2 = 0.5 * (1 - b / root);
            const mu2 = stretch2 * squash2;
            if (mu2 > 0.01) {
              drawLensedImage(
                p, alpha * Math.min(mu2, 1) * w,
                lensX - ux * r2, lensY - uy * r2,
                stretch2, Math.max(squash2, 0.25), angle
              );
            }
          }
          continue;
        }
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      const s = p.size;
      ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);

  // Make canvas container visible
  if (canvas.parentElement) {
    canvas.parentElement.style.opacity = '1';
  }

  document.dispatchEvent(new Event('hero-ready'));

  function startReveal() {
    if (window.__heroRevealStarted) return;
    window.__heroRevealStarted = true;
    revealTarget = 1;
    // Give the fade-in a moment, then let the page continue
    setTimeout(() => {
      document.dispatchEvent(new Event('hero-reveal-complete'));
    }, prefersMotion ? 1400 : 200);
  }

  const introShown = (() => {
    try { return sessionStorage.getItem('siteIntroShown') === '1'; } catch (_) { return false; }
  })();

  if (introShown || !prefersMotion) {
    reveal = 1;
    revealTarget = 1;
    window.__heroRevealStarted = true;
    document.dispatchEvent(new Event('hero-reveal-complete'));
  } else if (document.body.classList.contains('animation-ready')) {
    startReveal();
  } else {
    document.addEventListener('animation-ready', startReveal, { once: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try { initHeroSwarm(); } catch (error) { console.error('Error initializing hero swarm:', error); }
  });
} else {
  try { initHeroSwarm(); } catch (error) { console.error('Error initializing hero swarm:', error); }
}
