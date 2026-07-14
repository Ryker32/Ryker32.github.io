(() => {
  // Skip animation only if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INTRO_KEY = 'siteIntroShown';
  const hasSeenAnimation = (() => {
    try { return sessionStorage.getItem(INTRO_KEY) === '1'; } catch (_) { return false; }
  })();
  const heroCanvas = document.getElementById('heroCanvas');
  
  // If there's no hero section on this page, skip all animation logic
  if (!heroCanvas) {
    document.body.classList.add('animation-complete');
    document.body.classList.remove('animation-loading');
    document.documentElement.style.overflow = '';
    const siteMain = document.querySelector('.site-main');
    if (siteMain) siteMain.style.opacity = '1';
    const nav = document.querySelector('.glass-nav-wrapper');
    if (nav) nav.style.opacity = '1';
    return;
  }
  
  // Always play; no skip path

  const collapseHeroFrame = () => {};

  const prepHeroCanvasSmall = () => {
    if (!heroCanvas) return;
    heroCanvas.style.opacity = '1';
    heroCanvas.style.transform = 'none';
    heroCanvas.style.transition = 'opacity 0.8s ease';
  };

  if (prefersReducedMotion) {
    document.body.classList.add('animation-complete');
    const siteMain = document.querySelector('.site-main');
    if (siteMain) siteMain.style.opacity = '1';
    const heroCanvas = document.querySelector('.hero__canvas');
    if (heroCanvas) {
      heroCanvas.style.opacity = '0.9';
      heroCanvas.style.transform = 'scale(1)';
    }
    collapseHeroFrame();
    return;
  }

  // If we've already shown the intro this session, don't replay it
  if (hasSeenAnimation) {
    document.body.classList.add('animation-complete');
    document.body.classList.remove('animation-loading');
    document.documentElement.style.overflow = '';
    const nav = document.querySelector('.glass-nav-wrapper');
    const contentBlocks = document.querySelectorAll('.content-section, .site-footer');
    if (nav) nav.style.opacity = '1';
    contentBlocks.forEach((el) => { el.style.opacity = '1'; });
    // Let downstream listeners proceed as if reveal completed
    document.dispatchEvent(new Event('hero-reveal-complete'));
    return;
  }

  // Initialize animation sequence
  function initAnimation() {
    if (window.__siteIntroStarted) return;
    window.__siteIntroStarted = true;
    document.documentElement.style.overflow = 'hidden';

    let animationTriggered = false;

    // Make sure the hero is visible in its small state immediately
    prepHeroCanvasSmall();

    // Hide main/nav until after hero expands
    const siteMain = document.querySelector('.site-main');
    const nav = document.querySelector('.glass-nav-wrapper');
    const contentBlocks = document.querySelectorAll('.content-section, .site-footer');
    if (nav) nav.style.opacity = '0';
    // Keep hero visible; only hide content after the hero
    contentBlocks.forEach((el) => {
      el.style.opacity = '0';
    });

    function triggerAnimation() {
      if (animationTriggered) return;
      animationTriggered = true;

      const canvas = document.getElementById('heroCanvas');
      console.log('Triggering hero reveal', {
        canvasExists: !!canvas,
        canvasSize: canvas ? `${canvas.width}x${canvas.height}` : 'N/A',
        bodyClasses: document.body.className
      });

      document.body.classList.add('animation-ready');
      document.dispatchEvent(new Event('animation-ready'));
      collapseHeroFrame();
      startAnimationSequence();
    }

    // Trigger immediately (hero is the preloader)
    setTimeout(() => triggerAnimation(), 50);
  }

  // "Warp-in" for the hero title, Celestial-style (Eternals): the title's
  // light is wrapped into a gravitational swirl around a point — space
  // visibly folded — and as the singularity evaporates, reality unwinds and
  // the whole image smoothly de-lenses into place. Built on a custom
  // radial+swirl displacement field (not noise), so the distortion genuinely
  // curls around the emergence point like light around a black hole.
  function warpInHero(heroContent) {
    if (!heroContent) return;

    const rect = heroContent.getBoundingClientRect();
    const W = Math.max(rect.width, 1);
    const H = Math.max(rect.height, 1);

    // --- Displacement field: at each pixel, a vector that pulls the sample
    // point toward the center and curls it around it (swirl). Encoded in
    // R (x-offset) and G (y-offset) around 128 = zero, for feDisplacementMap.
    const MAP = 160;
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = MAP;
    mapCanvas.height = MAP;
    const mctx = mapCanvas.getContext('2d');
    const img = mctx.createImageData(MAP, MAP);
    for (let y = 0; y < MAP; y++) {
      for (let x = 0; x < MAP; x++) {
        const nx = (x / (MAP - 1)) * 2 - 1;   // -1 .. 1, center at 0
        const ny = (y / (MAP - 1)) * 2 - 1;
        const r = Math.min(Math.hypot(nx, ny), 1);
        // Strong near the point, fading smoothly to zero at the edge so the
        // outer region of the field never tears
        const fall = Math.pow(1 - r, 1.6);
        const pull = 0.5 * fall;              // radial: light dragged inward
        const curl = 0.85 * fall;             // tangential: frame-dragging swirl
        let dx = nx * pull + (-ny) * curl;
        let dy = ny * pull + (nx) * curl;
        dx = Math.max(-1, Math.min(1, dx));
        dy = Math.max(-1, Math.min(1, dy));
        const i = (y * MAP + x) * 4;
        img.data[i] = Math.round(128 + dx * 127);
        img.data[i + 1] = Math.round(128 + dy * 127);
        img.data[i + 2] = 128;
        img.data[i + 3] = 255;
      }
    }
    mctx.putImageData(img, 0, 0);
    const mapURL = mapCanvas.toDataURL();

    // Filter region: generous margins so heavily-displaced light isn't clipped
    const MX = 0.6 * W;
    const MY = 1.0 * H;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.innerHTML = `
      <defs>
        <filter id="heroWarpFilter" x="${-MX}" y="${-MY}" width="${W + 2 * MX}" height="${H + 2 * MY}"
                filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feImage href="${mapURL}" x="${-MX}" y="${-MY}" width="${W + 2 * MX}" height="${H + 2 * MY}"
                   preserveAspectRatio="none" result="field"/>
          <feDisplacementMap id="heroWarpDisp" in="SourceGraphic" in2="field" scale="0"
                             xChannelSelector="R" yChannelSelector="G" result="disp"/>
          <feColorMatrix in="disp" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rr"/>
          <feColorMatrix in="disp" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gg"/>
          <feColorMatrix in="disp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bb"/>
          <feOffset id="heroWarpROff" in="rr" dx="-8" dy="0" result="rOff"/>
          <feOffset id="heroWarpBOff" in="bb" dx="8" dy="0" result="bOff"/>
          <feBlend in="rOff" in2="gg" mode="screen" result="rg"/>
          <feBlend in="rg" in2="bOff" mode="screen"/>
        </filter>
      </defs>`;
    document.body.appendChild(svg);

    const disp = svg.querySelector('#heroWarpDisp');
    const rOff = svg.querySelector('#heroWarpROff');
    const bOff = svg.querySelector('#heroWarpBOff');

    // Light burst layer behind the content
    const hero = heroContent.closest('.hero') || heroContent.parentElement;
    const flash = document.createElement('div');
    flash.className = 'hero-warp-flash';
    flash.setAttribute('aria-hidden', 'true');
    hero.insertBefore(flash, heroContent);

    const DURATION = 2600;
    // Peak lens strength (px of displacement at the field's hottest point).
    // At the peak the title's light is fully wound around the singularity.
    const LENS_MAX = Math.max(W, H) * 0.9;

    // Tell the starfield a singularity is evaporating at the title's center:
    // background stars lens hard around the point, then relax as it decays.
    const canvas = document.getElementById('heroCanvas');
    const cx = rect.left + W / 2;
    const cy = rect.top + H / 2;
    if (typeof window.__heroWarpBurst === 'function' && canvas) {
      const cRect = canvas.getBoundingClientRect();
      window.__heroWarpBurst(cx - cRect.left, cy - cRect.top, DURATION + 400);
    }

    const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
    const easeInOut = (t) => t * t * (3 - 2 * t);

    heroContent.style.opacity = '0';
    heroContent.style.willChange = 'transform, opacity, filter';

    const start = performance.now();

    const frame = (now) => {
      const T = Math.min(1, (now - start) / DURATION);
      const e = easeOutQuint(T);
      const inv = 1 - e;

      // The fold: displacement starts at full strength (light wound around
      // the point), and space unwinds as the singularity evaporates
      disp.setAttribute('scale', String(LENS_MAX * Math.pow(inv, 1.35)));

      // Chromatic shear from the lensed light, collapsing with it
      const split = 8 * Math.pow(inv, 1.1);
      rOff.setAttribute('dx', String(-split));
      bOff.setAttribute('dx', String(split));

      // The object itself grows out of the point while its wound-up rotation
      // unwinds — reality visibly rotating outward from the singularity
      const grow = 0.1 + 0.9 * e;
      const rot = -110 * inv * inv;
      heroContent.style.transform = `rotate(${rot.toFixed(2)}deg) scale(${grow.toFixed(4)})`;

      // White-hot while deep in the fold, cooling as it arrives
      const heat = 1 + 2.2 * Math.pow(inv, 1.8);
      heroContent.style.filter = `url(#heroWarpFilter) brightness(${heat.toFixed(3)})`;

      heroContent.style.opacity = String(Math.min(1, T / 0.12));

      // Flash: hot point of light at the singularity that blooms and dies
      const flashT = T < 0.14 ? easeInOut(T / 0.14) : Math.max(0, 1 - (T - 0.14) / 0.5);
      flash.style.opacity = String(0.95 * flashT);
      flash.style.transform = `scale(${(0.15 + 1.25 * e).toFixed(3)})`;

      if (T < 1) {
        requestAnimationFrame(frame);
      } else {
        // Settle: drop the filter so the text renders crisp
        heroContent.style.filter = '';
        heroContent.style.transform = '';
        heroContent.style.opacity = '1';
        heroContent.style.willChange = '';
        flash.remove();
        svg.remove();
      }
    };

    requestAnimationFrame(frame);
  }

  function startAnimationSequence() {
    const canvas = document.getElementById('heroCanvas');
    const siteMain = document.querySelector('.site-main');
    const nav = document.querySelector('.glass-nav-wrapper');
    const contentBlocks = document.querySelectorAll('.content-section, .site-footer');
    const nonHeroSections = document.querySelectorAll('.site-main > *:not(.hero)');
    const heroContent = document.querySelector('.hero__content');

    // Ensure hero is visible; no canvas scaling
    if (canvas) {
      canvas.style.opacity = '1';
      canvas.style.transform = 'none';
      canvas.style.transition = 'opacity 0.8s ease';
    }

    // Hide nav/content until swarm reveal finishes; keep canvas and hero card visible
    if (nav) nav.style.opacity = '0';
    nonHeroSections.forEach((el) => {
      el.style.opacity = '0';
    });
    contentBlocks.forEach((el) => {
      el.style.opacity = '0';
    });

    let revealDone = false;
    const onHeroDone = () => {
      if (revealDone) return;
      revealDone = true;
      setTimeout(() => {
        if (nav) {
          nav.style.transition = 'opacity 0.5s ease';
          nav.style.opacity = '1';
        }
        // Warp the title card into existence
        warpInHero(heroContent);
        nonHeroSections.forEach((el) => {
          el.style.transition = 'opacity 0.5s ease';
          el.style.opacity = '1';
        });
        contentBlocks.forEach((el) => {
          el.style.transition = 'opacity 0.5s ease';
          el.style.opacity = '1';
        });
        document.body.classList.add('animation-complete');
        document.body.classList.remove('animation-loading');
        document.documentElement.style.overflow = '';
        collapseHeroFrame();
        try { sessionStorage.setItem(INTRO_KEY, '1'); } catch (_) {}
      }, 350); // slight delay after hero completes
    };

    document.addEventListener('hero-reveal-complete', onHeroDone, { once: true });
    // Fallback in case hero-reveal-complete never fires (e.g., WebGL fails)
    setTimeout(onHeroDone, 3000);
  }

  // Start animation initialization promptly
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initAnimation, 50);
    });
  } else {
    setTimeout(initAnimation, 50);
  }
})();

// Scroll-reveal: elements rise in as they enter the viewport
(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const REVEAL_SELECTORS = [
    '.project-card',
    '.portfolio-header',
    '.site-footer > *',
    '.contact-tile',
    '.contact-header',
    '.rocketry__card',
    '.about-panel',
    '.about-hero__text',
    '.about-hero__media'
  ].join(', ');

  function initReveal() {
    const elements = document.querySelectorAll(REVEAL_SELECTORS);
    if (!elements.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  // portfolio.js injects cards on DOMContentLoaded and is loaded first,
  // so by the time this runs the cards exist.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();
