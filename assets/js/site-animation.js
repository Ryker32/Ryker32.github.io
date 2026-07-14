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

  // "Warp-in" for the hero title: space-fold distortion (SVG displacement),
  // chromatic aberration that collapses to zero, a stretched-space snap, and
  // a light burst — like a jump-ship materializing.
  function warpInHero(heroContent) {
    if (!heroContent) return;

    // Build the SVG filter once
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.innerHTML = `
      <defs>
        <filter id="heroWarpFilter" x="-40%" y="-60%" width="180%" height="220%" color-interpolation-filters="sRGB">
          <feTurbulence id="heroWarpNoise" type="fractalNoise" baseFrequency="0.012 0.045" numOctaves="2" seed="7" result="noise"/>
          <feDisplacementMap id="heroWarpDisp" in="SourceGraphic" in2="noise" scale="420" xChannelSelector="R" yChannelSelector="G" result="disp"/>
          <feColorMatrix in="disp" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rr"/>
          <feColorMatrix in="disp" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gg"/>
          <feColorMatrix in="disp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bb"/>
          <feOffset id="heroWarpROff" in="rr" dx="-14" dy="0" result="rOff"/>
          <feOffset id="heroWarpBOff" in="bb" dx="14" dy="0" result="bOff"/>
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

    const DURATION = 1500;
    const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

    heroContent.style.opacity = '0';
    heroContent.style.filter = 'url(#heroWarpFilter)';
    heroContent.style.transform = 'scale(1.45, 0.55)';
    heroContent.style.willChange = 'transform, opacity, filter';

    const start = performance.now();

    const frame = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      const e = easeOutQuint(t);

      // Distortion collapses as reality "settles"
      disp.setAttribute('scale', String(420 * (1 - e)));
      noise.setAttribute('baseFrequency', `${0.012 + 0.02 * (1 - e)} ${0.045 * (1 - e) + 0.008}`);
      const split = 14 * (1 - e);
      rOff.setAttribute('dx', String(-split));
      bOff.setAttribute('dx', String(split));

      // Emerge stretched through the fold, snap to true scale
      const sx = 1.45 - 0.45 * e;
      const sy = 0.55 + 0.45 * e;
      heroContent.style.transform = `scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;

      // Fade in fast at the front of the warp
      heroContent.style.opacity = String(Math.min(1, t / 0.25));

      // Flash: spike early, decay by ~60%
      const flashT = t < 0.16 ? t / 0.16 : Math.max(0, 1 - (t - 0.16) / 0.45);
      flash.style.opacity = String(0.9 * flashT);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        // Settle: remove the filter so text renders crisp
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
