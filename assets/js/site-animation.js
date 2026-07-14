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

  // "Warp-in" for the hero title: an accretion spiral run in reverse.
  // The text is shattered into characters that all begin at the singularity
  // point, then stream outward along decaying orbital spirals — innermost
  // material escapes first, each fragment unwinding its orbit and cooling
  // from white-hot as it settles into place. A displacement filter distorts
  // reality around the emergence and the starfield lenses around the point.
  function warpInHero(heroContent) {
    if (!heroContent) return;

    // Build the SVG filter once (spacetime shimmer + global RGB shear)
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.innerHTML = `
      <defs>
        <filter id="heroWarpFilter" x="-40%" y="-60%" width="180%" height="220%" color-interpolation-filters="sRGB">
          <feTurbulence id="heroWarpNoise" type="fractalNoise" baseFrequency="0.012 0.045" numOctaves="2" seed="7" result="noise"/>
          <feDisplacementMap id="heroWarpDisp" in="SourceGraphic" in2="noise" scale="220" xChannelSelector="R" yChannelSelector="G" result="disp"/>
          <feColorMatrix in="disp" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rr"/>
          <feColorMatrix in="disp" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gg"/>
          <feColorMatrix in="disp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bb"/>
          <feOffset id="heroWarpROff" in="rr" dx="-10" dy="0" result="rOff"/>
          <feOffset id="heroWarpBOff" in="bb" dx="10" dy="0" result="bOff"/>
          <feBlend in="rOff" in2="gg" mode="screen" result="rg"/>
          <feBlend in="rg" in2="bOff" mode="screen"/>
        </filter>
      </defs>`;
    document.body.appendChild(svg);

    const disp = svg.querySelector('#heroWarpDisp');
    const noise = svg.querySelector('#heroWarpNoise');
    const rOff = svg.querySelector('#heroWarpROff');
    const bOff = svg.querySelector('#heroWarpBOff');

    // Light burst layer behind the content
    const hero = heroContent.closest('.hero') || heroContent.parentElement;
    const flash = document.createElement('div');
    flash.className = 'hero-warp-flash';
    flash.setAttribute('aria-hidden', 'true');
    hero.insertBefore(flash, heroContent);

    const DURATION = 2400;
    // How far each fragment's orbit is wound up at birth (radians). Every
    // character sweeps this arc as it spirals out, so early on the whole
    // title is a rotating disc of matter around the point.
    const SWIRL = -3.4;
    // Fraction of the timeline each fragment spends in flight
    const TRAVEL = 0.55;

    // Tell the starfield a singularity is evaporating at the title's center:
    // background stars lens hard around the point, then relax as it decays.
    const canvas = document.getElementById('heroCanvas');
    const heroRect = heroContent.getBoundingClientRect();
    const cx = heroRect.left + heroRect.width / 2;
    const cy = heroRect.top + heroRect.height / 2;
    if (typeof window.__heroWarpBurst === 'function' && canvas) {
      const cRect = canvas.getBoundingClientRect();
      window.__heroWarpBurst(cx - cRect.left, cy - cRect.top, DURATION + 500);
    }

    // --- Shatter the text into per-character fragments ---
    // Each word goes inside a no-break wrapper so the character spans can't
    // change where lines wrap (otherwise the settled text would jump).
    const originalHTML = heroContent.innerHTML;
    const wrapChars = (root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      const spans = [];
      nodes.forEach((node) => {
        const frag = document.createDocumentFragment();
        let word = null;
        for (const ch of node.textContent) {
          if (/\s/.test(ch)) {
            word = null;
            frag.appendChild(document.createTextNode(ch));
            continue;
          }
          if (!word) {
            word = document.createElement('span');
            word.style.display = 'inline-block';
            word.style.whiteSpace = 'nowrap';
            frag.appendChild(word);
          }
          const s = document.createElement('span');
          s.textContent = ch;
          s.style.display = 'inline-block';
          s.style.willChange = 'transform, opacity';
          word.appendChild(s);
          spans.push(s);
        }
        node.parentNode.replaceChild(frag, node);
      });
      return spans;
    };
    const chars = wrapChars(heroContent);

    // Measure each fragment's resting position relative to the singularity
    let rMax = 1;
    const parts = chars.map((el) => {
      const r = el.getBoundingClientRect();
      const dx = r.left + r.width / 2 - cx;
      const dy = r.top + r.height / 2 - cy;
      const rad = Math.hypot(dx, dy);
      if (rad > rMax) rMax = rad;
      return { el, dx, dy, rad, ang: Math.atan2(dy, dx), jit: Math.random() };
    });
    // Inner material escapes the point first; outer streams out after —
    // the spiral visibly grows outward from the center.
    parts.forEach((p) => {
      p.delay = Math.min(0.03 + 0.32 * (p.rad / rMax) + 0.08 * p.jit, 1 - TRAVEL);
      // Start hidden at the singularity
      p.el.style.opacity = '0';
      p.el.style.transform = `translate(${-p.dx}px, ${-p.dy}px) scale(0.05)`;
    });

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    heroContent.style.opacity = '1';
    heroContent.style.willChange = 'filter';
    heroContent.classList.add('is-warping');

    const start = performance.now();

    const frame = (now) => {
      const T = Math.min(1, (now - start) / DURATION);
      const gInv = 1 - easeOutQuart(T);

      // Reality distortion + global chromatic shear die off with the singularity
      disp.setAttribute('scale', String(220 * Math.pow(gInv, 1.5)));
      noise.setAttribute('baseFrequency', `${0.012 + 0.02 * gInv} ${0.045 * gInv + 0.008}`);
      const split = 10 * Math.pow(gInv, 1.2);
      rOff.setAttribute('dx', String(-split));
      bOff.setAttribute('dx', String(split));
      const heat = 1 + 1.6 * gInv * gInv;
      heroContent.style.filter = `url(#heroWarpFilter) brightness(${heat.toFixed(3)})`;

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const lt = Math.min(Math.max((T - p.delay) / TRAVEL, 0), 1);
        if (lt <= 0) continue;

        // Orbit: radius grows out from the point while the wound-up angle
        // unwinds — a decaying spiral, i.e. accretion in reverse
        const g = easeOutCubic(lt);
        const r = p.rad * g;
        const a = p.ang + SWIRL * (1 - g);
        const x = Math.cos(a) * r - p.dx;
        const y = Math.sin(a) * r - p.dy;
        // The fragment tumbles with its orbital sweep and grows as it cools
        const spin = (SWIRL * (1 - g) * 180) / Math.PI;
        const sc = 0.2 + 0.8 * g;
        p.el.style.transform =
          `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${spin.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        p.el.style.opacity = String(Math.min(1, lt / 0.2));

        // Per-fragment chromatic shear + white-hot glow while in flight
        const hot = 1 - g;
        p.el.style.textShadow = hot > 0.02
          ? `${(-7 * hot).toFixed(2)}px 0 rgba(255,70,70,${(0.85 * hot).toFixed(3)}), ` +
            `${(7 * hot).toFixed(2)}px 0 rgba(80,140,255,${(0.85 * hot).toFixed(3)}), ` +
            `0 0 ${(16 * hot).toFixed(2)}px rgba(255,255,255,${(0.9 * hot).toFixed(3)})`
          : '';
      }

      // Flash: hot point of light at the singularity that blooms and dies
      const flashT = T < 0.12 ? T / 0.12 : Math.max(0, 1 - (T - 0.12) / 0.5);
      flash.style.opacity = String(0.95 * flashT);
      flash.style.transform = `scale(${(0.15 + 1.3 * easeOutQuart(T)).toFixed(3)})`;

      if (T < 1) {
        requestAnimationFrame(frame);
      } else {
        // Settle: restore the original markup so text renders crisp
        heroContent.style.filter = '';
        heroContent.style.opacity = '1';
        heroContent.style.willChange = '';
        heroContent.classList.remove('is-warping');
        heroContent.innerHTML = originalHTML;
        // Let the custom cursor rebind targets recreated by the restore
        heroContent.querySelectorAll('[data-cursor-bound]').forEach((el) => {
          delete el.dataset.cursorBound;
        });
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
