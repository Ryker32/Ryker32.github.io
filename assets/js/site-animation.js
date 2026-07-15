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
  
  const prepHeroCanvas = () => {
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

    // Make sure the starfield is visible immediately
    prepHeroCanvas();

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

      document.body.classList.add('animation-ready');
      document.dispatchEvent(new Event('animation-ready'));
      startAnimationSequence();
    }

    // Trigger immediately (hero is the preloader)
    setTimeout(() => triggerAnimation(), 50);
  }

  // Liquid ripple intro: the page opens as bare starfield. A dot of light
  // pulses at the center of the viewport, then releases a single radial
  // ripple: the starfield physically waves (handled in hero3d.js) and a
  // refractive glass ring sweeps outward over the page. Page elements (hero
  // content, glass nav) are wiped into view by the wavefront itself: an
  // expanding radial mask synced to the ripple radius uncovers their pixels
  // exactly where the wave has already passed. Calls `onDone` when finished.
  function rippleIntro(onDone) {
    const heroContent = document.querySelector('.hero__content');
    const nav = document.querySelector('.glass-nav-wrapper');

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    // Feathered trailing edge of the reveal, roughly matching the glass band
    const EDGE = 90;

    // Elements the wavefront wipes over. Each carries the ripple center in
    // its own local coordinates (masks are positioned relative to the
    // element's box) and the distance at which it's fully uncovered.
    const revealTargets = [];
    if (heroContent) {
      heroContent.style.opacity = '1';   // reveal is handled by the mask
      revealTargets.push(heroContent);
    }
    if (nav) {
      nav.style.opacity = '1';
      revealTargets.push(nav);
    }

    const items = revealTargets.map((el) => {
      const r = el.getBoundingClientRect();
      const lx = cx - r.left;
      const ly = cy - r.top;
      // Farthest corner of the element from the ripple center
      const far = Math.max(
        Math.hypot(lx, ly),
        Math.hypot(r.width - lx, ly),
        Math.hypot(lx, r.height - ly),
        Math.hypot(r.width - lx, r.height - ly)
      );
      return { el, lx, ly, far, done: false };
    });

    const setMask = (item, R) => {
      const inner = Math.max(0, R - EDGE);
      const img = `radial-gradient(circle at ${item.lx.toFixed(1)}px ${item.ly.toFixed(1)}px, ` +
        `#000 ${inner.toFixed(1)}px, transparent ${Math.max(R, 0.1).toFixed(1)}px)`;
      item.el.style.webkitMaskImage = img;
      item.el.style.maskImage = img;
    };

    // Hide everything until the wave uncovers it
    items.forEach((item) => setMask(item, 0));

    const clearMask = (item) => {
      item.done = true;
      item.el.style.webkitMaskImage = '';
      item.el.style.maskImage = '';
    };

    // The emitting dot
    const dot = document.createElement('div');
    dot.className = 'intro-ripple-dot';
    dot.setAttribute('aria-hidden', 'true');
    dot.style.left = `${cx}px`;
    dot.style.top = `${cy}px`;
    document.body.appendChild(dot);

    // The refractive glass ring
    const ring = document.createElement('div');
    ring.className = 'intro-ripple-ring';
    ring.setAttribute('aria-hidden', 'true');
    ring.style.left = `${cx}px`;
    ring.style.top = `${cy}px`;
    document.body.appendChild(ring);

    const DOT_MS = 650;        // dot pulse before the wave releases
    const RIPPLE_MS = 1900;    // wavefront travel time
    // Reach past the farthest corner so the band fully exits the viewport
    const maxR = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy)
    ) + 180;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // Phase 1: dot swells like surface tension about to break
    const dotStart = performance.now();
    const dotFrame = (now) => {
      const t = Math.min(1, (now - dotStart) / DOT_MS);
      const s = t < 0.75 ? 0.2 + 1.3 * easeOutCubic(t / 0.75) : 1.5 - 1.5 * ((t - 0.75) / 0.25);
      dot.style.transform = `translate(-50%, -50%) scale(${Math.max(s, 0).toFixed(3)})`;
      dot.style.opacity = String(Math.min(1, t / 0.2));
      if (t < 1) {
        requestAnimationFrame(dotFrame);
      } else {
        dot.remove();
        startWave();
      }
    };

    // Phase 2: the ripple radiates out
    function startWave() {
      // Drive the starfield's liquid wave from the same origin
      const canvas = document.getElementById('heroCanvas');
      if (typeof window.__heroRipple === 'function' && canvas) {
        const cRect = canvas.getBoundingClientRect();
        window.__heroRipple(cx - cRect.left, cy - cRect.top, maxR, RIPPLE_MS);
      }

      const start = performance.now();
      const frame = (now) => {
        const t = Math.min(1, (now - start) / RIPPLE_MS);
        const R = maxR * easeOutCubic(t);

        ring.style.width = `${(R * 2).toFixed(1)}px`;
        ring.style.height = `${(R * 2).toFixed(1)}px`;
        // The glass band thins out and fades as the wave loses energy
        ring.style.opacity = String(Math.max(0, 1 - Math.pow(t, 2.2)));

        // Sweep the reveal mask with the wavefront; once an element is
        // fully behind the wave, drop its mask entirely
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.done) continue;
          if (R >= item.far + EDGE) {
            clearMask(item);
          } else {
            setMask(item, R);
          }
        }

        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          items.forEach((item) => { if (!item.done) clearMask(item); });
          ring.remove();
          if (onDone) onDone();
        }
      };
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(dotFrame);
  }

  function startAnimationSequence() {
    const nav = document.querySelector('.glass-nav-wrapper');
    const contentBlocks = document.querySelectorAll('.content-section, .site-footer');
    const nonHeroSections = document.querySelectorAll('.site-main > *:not(.hero)');

    prepHeroCanvas();

    // Hide nav/content until the starfield fades in; the ripple reveals them
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
        // The ripple sweeps outward and loads the hero + nav as it passes;
        // everything below the fold fades in once the wave has left the page
        rippleIntro(() => {
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
          try { sessionStorage.setItem(INTRO_KEY, '1'); } catch (_) {}
        });
      }, 300); // slight beat after the starfield settles
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
